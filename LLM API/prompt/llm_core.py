from openai import OpenAI


# Do we use the OpenAI client even if we use a different model? - Dario
# Initialize the client for RWTH Aachen LLM
client = OpenAI(
    api_key="sk-1D3VVV2S52kdBhGPav4tIQ",
    base_url="https://llm.hpc.itc.rwth-aachen.de"
)

# Choose a model
smallmodel = "mistralai/Mistral-Small-3.2-24B-Instruct-2506" # 24B parameters
model = "openai/gpt-oss-120b"  # OpenAI 120b

def call_llm(system_prompt, user_prompt):
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
    )
    return resp.choices[0].message.content