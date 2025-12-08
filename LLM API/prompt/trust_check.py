from .llm_core import call_llm


def trust_checker(document_text):

    system_prompt = f"""
        You assess how trustworthy a document is and rate it on a scale of 1-10 (1 being not trustworthy at all and 10 being the most trustworthy).
        Adopt a skeptical but neutral stance.
        Value clear sourcing, explicit reasoning, and appropriate caution.
        """
    
    user_prompt = f"""
    DOCUMENT:\"\"\"{document_text}\"\"\" 
    """

    return call_llm(system_prompt,user_prompt)