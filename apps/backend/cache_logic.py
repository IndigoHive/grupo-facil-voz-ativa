from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc
import models
import schemas
from redis_client import set_cache, get_cache, CACHE_KEY_CALLS, CACHE_KEY_FILTERS
from datetime import datetime
from typing import List, Optional, Dict
import json

# Custom encoder for datetime objects if using standard json dump
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)


def fetch_and_cache_data(db: Session, empresa_id: int):
    if not empresa_id:
        raise ValueError("empresa_id is required for cache update to prevent server overload")

    print(f"[{datetime.now()}] Starting cache update... Empresa ID: {empresa_id}")
    
    # 1. Fetch calls with relationships
    query = db.query(models.CogfyAll).options(
        joinedload(models.CogfyAll.themes),
        joinedload(models.CogfyAll.initial_customer_sentiments),
        joinedload(models.CogfyAll.end_customer_sentiments),
        joinedload(models.CogfyAll.agent_sentiments),
        joinedload(models.CogfyAll.criterios_rn),
        joinedload(models.CogfyAll.criterios_rn623)
    )

    query = query.filter(models.CogfyAll.Empresa_id == empresa_id)
    calls_query = query.all()
    # Process single company
    _process_and_cache_calls(calls_query, empresa_id)
    return len(calls_query)

def _process_and_cache_calls(calls_query: List[models.CogfyAll], empresa_id: int):
    # Serialize
    calls_data = [schemas.CallData.model_validate(call).model_dump(mode='json') for call in calls_query]
    
    # Save calls to Redis (Per Company)
    set_cache(f"{CACHE_KEY_CALLS}:{empresa_id}", calls_data, expire=3600 * 2)
    
    # Filter calculation for this company
    filters = {
        "temas": list(set(t['Temas'] for c in calls_data for t in c.get('themes', []))),
        "sentimento_inicial": list(set(s['Sentimento'] for c in calls_data for s in c.get('initial_customer_sentiments', []))),
        "sentimento_final": list(set(s['Sentimento'] for c in calls_data for s in c.get('end_customer_sentiments', []))),
        "sentimento_agente": list(set(s['Sentimento'] for c in calls_data for s in c.get('agent_sentiments', []))),
        "criterios_rn623": list(set(crit['Criterio'] for c in calls_data for crit in c.get('criterios_rn623', []))),
        "sentimento_geral": list(set(c['Overall_customer_sentiment'] for c in calls_data if c.get('Overall_customer_sentiment'))),
        "resolucao": list(set(c['Resolution_Status'] for c in calls_data if c.get('Resolution_Status'))),
        "qualidade_servico": list(set(c['Quality_of_service'] for c in calls_data if c.get('Quality_of_service'))),
        "nivel_conformidade_rn": list(set(c['Nivel_Conformidade_RN'] for c in calls_data if c.get('Nivel_Conformidade_RN'))),
    }
    
    # Save filters to Redis (Per Company)
    set_cache(f"{CACHE_KEY_FILTERS}:{empresa_id}", filters, expire=3600 * 2)


def get_unique_filters(calls_data: List[Dict]) -> Dict:
    return {
        "temas": list(set(t['Temas'] for c in calls_data for t in c.get('themes', []))),
        "sentimento_inicial": list(set(s['Sentimento'] for c in calls_data for s in c.get('initial_customer_sentiments', []))),
        "sentimento_final": list(set(s['Sentimento'] for c in calls_data for s in c.get('end_customer_sentiments', []))),
        "sentimento_agente": list(set(s['Sentimento'] for c in calls_data for s in c.get('agent_sentiments', []))),
        "criterios_rn623": list(set(crit['Criterio'] for c in calls_data for crit in c.get('criterios_rn623', []))),
        "sentimento_geral": list(set(c['Overall_customer_sentiment'] for c in calls_data if c.get('Overall_customer_sentiment'))),
        "resolucao": list(set(c['Resolution_Status'] for c in calls_data if c.get('Resolution_Status'))),
        "qualidade_servico": list(set(c['Quality_of_service'] for c in calls_data if c.get('Quality_of_service'))),
        "nivel_conformidade_rn": list(set(c['Nivel_Conformidade_RN'] for c in calls_data if c.get('Nivel_Conformidade_RN'))),
    }

def get_cached_calls(
    skip: int = 0,
    limit: int = 10,
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    order: Optional[str] = "asc",
    min_duration: Optional[float] = None,
    max_duration: Optional[float] = None,
    min_score: Optional[int] = None,
    max_score: Optional[int] = None,
    min_silence: Optional[float] = None,
    max_silence: Optional[float] = None,
    min_rn623_points: Optional[int] = None,
    max_rn623_points: Optional[int] = None,
    min_rn623_score: Optional[float] = None,
    max_rn623_score: Optional[float] = None,
    temas: Optional[List[str]] = None,
    sentimento_inicial: Optional[List[str]] = None,
    sentimento_final: Optional[List[str]] = None,
    sentimento_agente: Optional[List[str]] = None,
    criterios_rn623: Optional[List[str]] = None,
    sentimento_geral: Optional[List[str]] = None,
    resolucao: Optional[List[str]] = None,
    qualidade_servico: Optional[List[str]] = None,
    nivel_conformidade_rn: Optional[List[str]] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    empresa_id: Optional[int] = None,
) -> Dict:
    
    if empresa_id is None:
         return []

    # Get Company Specific Cache
    raw_data = get_cache(f"{CACHE_KEY_CALLS}:{empresa_id}")
    if raw_data is None:
        return None # Cache miss
        
    filtered_data = raw_data
    
    # 1. Search Filter
    if search:
        search_lower = search.lower()
        filtered_data = [
            c for c in filtered_data
            if (c.get('Agent_name') and search_lower in c['Agent_name'].lower()) or
               (c.get('Customer_Name') and search_lower in c['Customer_Name'].lower()) or
               (c.get('Resolution_Status') and search_lower in c['Resolution_Status'].lower()) or
               (c.get('Protocol_Number') and search_lower in c['Protocol_Number'].lower())
        ]

    # 2. Date Filter

    if start_date:
        filtered_data = [c for c in filtered_data if c.get('Create_date') and c['Create_date'] >= start_date]
    if end_date:
        # Assuming end_date is inclusive for the day
        filtered_data = [c for c in filtered_data if c.get('Create_date') and c['Create_date'] <= f"{end_date}T23:59:59"]

    # 3. Numeric Ranges
    if min_duration is not None:
        filtered_data = [c for c in filtered_data if c.get('Call_duration') is not None and c['Call_duration'] >= min_duration]
    if max_duration is not None:
        filtered_data = [c for c in filtered_data if c.get('Call_duration') is not None and c['Call_duration'] <= max_duration]
        
    if min_score is not None:
        filtered_data = [c for c in filtered_data if c.get('IRC_Score') is not None and c['IRC_Score'] >= min_score]
    if max_score is not None:
        filtered_data = [c for c in filtered_data if c.get('IRC_Score') is not None and c['IRC_Score'] <= max_score]
        
    if min_silence is not None:
        filtered_data = [c for c in filtered_data if c.get('Call_silence') is not None and c['Call_silence'] >= min_silence]
    if max_silence is not None:
        filtered_data = [c for c in filtered_data if c.get('Call_silence') is not None and c['Call_silence'] <= max_silence]
        
    if min_rn623_points is not None:
        filtered_data = [c for c in filtered_data if c.get('Pontos_Obtidos_RN623') is not None and c['Pontos_Obtidos_RN623'] >= min_rn623_points]
    if max_rn623_points is not None:
        filtered_data = [c for c in filtered_data if c.get('Pontos_Obtidos_RN623') is not None and c['Pontos_Obtidos_RN623'] <= max_rn623_points]
        
    if min_rn623_score is not None:
        filtered_data = [c for c in filtered_data if c.get('Score_Conformidade_RN623') is not None and c['Score_Conformidade_RN623'] >= min_rn623_score]
    if max_rn623_score is not None:
        filtered_data = [c for c in filtered_data if c.get('Score_Conformidade_RN623') is not None and c['Score_Conformidade_RN623'] <= max_rn623_score]

    # 4. List Filters ("AND" logic based on previous user preferences? Or "OR"?
    # The user instruction was "Refining Multi-Select Filters... implement an "AND" logic".
    # So if I select 2 themes, the call must have BOTH.
    
    if temas:
        filtered_data = [c for c in filtered_data if all(t in [th['Temas'] for th in c.get('themes', [])] for t in temas)]
        
    if sentimento_inicial:
        filtered_data = [c for c in filtered_data if all(s in [si['Sentimento'] for si in c.get('initial_customer_sentiments', [])] for s in sentimento_inicial)]
        
    if sentimento_final:
        filtered_data = [c for c in filtered_data if all(s in [sf['Sentimento'] for sf in c.get('end_customer_sentiments', [])] for s in sentimento_final)]
        
    if sentimento_agente:
        filtered_data = [c for c in filtered_data if all(s in [sa['Sentimento'] for sa in c.get('agent_sentiments', [])] for s in sentimento_agente)]
        
    if criterios_rn623:
        filtered_data = [c for c in filtered_data if all(crit in [cr['Criterio'] for cr in c.get('criterios_rn623', [])] for crit in criterios_rn623)]

    # 5. String Enums (Checkbox lists) - These are usually "OR" logic in standard UI, or user specified AND?
    # Usually Resolution Status can only be one, so "in_" suggests OR (if I select 'Resolved' and 'Pending', show both).
    # Previous implementation used `.in_`, which is OR.
    if sentimento_geral:
        filtered_data = [c for c in filtered_data if c.get('Overall_customer_sentiment') in sentimento_geral]
    if resolucao:
        filtered_data = [c for c in filtered_data if c.get('Resolution_Status') in resolucao]
    if qualidade_servico:
        filtered_data = [c for c in filtered_data if c.get('Quality_of_service') in qualidade_servico]
    if nivel_conformidade_rn:
        filtered_data = [c for c in filtered_data if c.get('Nivel_Conformidade_RN') in nivel_conformidade_rn]

    # 6. Sorting
    if sort_by:
        reverse = (order == 'desc')
        # Handle missing values when sorting (e.g. putting None at end or start)
        # Python 3 sorting with None will fail. We need a key function.
        def sort_key(x):
            val = x.get(sort_by)
            if val is None:
                return float('-inf') if reverse else float('inf') # Push Nones to bottom usually? Or top?
                # Let's use standard default: empty string or 0 depending on type, or just a very small/large number
                # Actually safest is to check type.
                return "" 
            return val
            
        filtered_data.sort(key=sort_key, reverse=reverse)
    else:
        # Default sort by Create_date desc
        filtered_data.sort(key=lambda x: x.get('Create_date') or "", reverse=True)

    # 7. Pagination
    total = len(filtered_data)
    paginated_data = filtered_data[skip : skip + limit]
    
    return {"total": total, "data": paginated_data}
