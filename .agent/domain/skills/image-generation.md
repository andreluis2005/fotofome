# Image Generation Skill

**Purpose:** 
Tirar a carga mental do restaurante. Caso ele não tenha nem mesmo uma foto ruim do prato, ele digita "Xis Calabresa com Queijo" e nós cuspiríamos uma renderização comercialmente perfeita para servir de base.

**Inputs:**
- `dishDescription` (String do Usuário)

**Outputs:**
- `generatedImageUrl` (String)

**Implementation notes:**
Implementado sobre a interface de Text-to-Image na nossa infra `src/services/ai/providers`, o texto do input sofrerá fusão em tempo real no servidor com a estrutura-mestre definida no `food-generate.prompt.md` antes do dispatch.
