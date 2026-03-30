# Food Prompt Engineering Skill

**Purpose:**
Refinar dinamicamente e "temperar" a requisição do usuário injetando as variáveis fotográficas essenciais. É a barreira protetora que impede o motor SD/DALL-E de cuspir um alimento genérico e forçar uma renderização profissional.

**Inputs:**
- `userRawPrompt` (Ex: "Batata frita na tigela")

**Outputs:**
- `cinematicFoodPrompt` (Ex: "Golden crispy french fries in a pure white ceramic bowl, extreme close up [...]")

**Implementation notes:**
Não manipula as imagens. É estritamente semântica (processamento da linguagem focada). Provavelmente chamando uma inferência text-to-text rápida (GPT-3/4-mini) antes de mandar ao gerador final.
