from openai import OpenAI

client = OpenAI(
    api_key="sk-1D3VVV2S52kdBhGPav4tIQ",
    base_url="https://llm.hpc.itc.rwth-aachen.de"
)

models = client.models.list()
for m in models.data:
    print(m.id)

# Output:
# mistralai/Mixtral-8x22B-Instruct-v0.1
# mistralai/Mistral-Small-3.2-24B-Instruct-2506
# openai/gpt-oss-120b
# swiss-ai/Apertus-70B-Instruct-2509