# HermeticSaaS Custom Commands

> **"Speak the command, and the agents execute."**

## 🎯 Overview

Custom slash commands that orchestrate the 38 Hermetic Agents to execute complex MicroSaaS workflows with a single command.

---

## 📜 Available Commands

### `/discover [topic]`
**Purpose**: Execute the complete Discovery Pipeline to find and validate MicroSaaS opportunities

**Agent Flow**: Janus → Echo → Metis → Prometheus → Chronos

**Usage**:
```bash
/discover AI productivity tools
/discover developer pain points
/discover remote work challenges
```

**What It Does**:
1. **Janus** researches trends, competitors, and pain points (50+ sources)
2. **Echo** synthesizes feedback and identifies core problems
3. **Metis** validates with user research and personas
4. **Prometheus** analyzes competitive landscape
5. **Chronos** scores opportunity viability (>70 = build it)

**Output**: Complete discovery report with validated opportunities and go/no-go decision

**When to Use**:
- Starting a new MicroSaaS search
- Exploring a market or domain
- Need comprehensive market research

---

### `/validate [idea]`
**Purpose**: Rapid validation of a specific MicroSaaS idea

**Agent Flow**: Echo → Prometheus → Sol → Chronos

**Usage**:
```bash
/validate AI tool for phone anxiety practice
/validate subscription box curator app
/validate no-code automation builder
```

**What It Does**:
1. **Echo** assesses market demand signals quickly
2. **Prometheus** checks competitive landscape
3. **Sol** evaluates technical feasibility
4. **Chronos** provides rapid viability score (40+ = strong validation)

**Output**: Quick validation report with score and recommendation

**When to Use**:
- Have a specific idea to test
- Need fast validation before deep research
- Checking if idea is worth full /discover

---

### `/invoke-agent [agent-name] [task]`
**Purpose**: Directly invoke a specific Hermetic Agent for custom tasks

**Usage**:
```bash
/invoke-agent janus research TikTok trends for creators
/invoke-agent venus design beautiful login screen
/invoke-agent mars debug authentication flow
/invoke-agent psyche create viral TikTok strategy
```

**What It Does**:
Executes the requested task using the agent's specialized capabilities as defined in their playbooks

**Available Agents**:
- **Core Seven**: sol, luna, mercury, venus, mars, jupiter, saturn
- **Engineering**: uranus, neptune, ceres, pallas, iris
- **Marketing**: fortuna, eris, psyche, juno, vesta, calliope
- **Design**: hera, metis, titan, eros
- **Product**: echo, chronos, janus
- **PM**: atlas, rhea, io
- **Operations**: hygeia, plutus, vulcan, themis, chiron
- **Testing**: ganymede, europa, callisto, prometheus, daedalus
- **Bonus**: momus, mentor

**When to Use**:
- Need a specific agent's expertise
- Custom task not covered by other commands
- Testing individual agent capabilities

---

## 🚀 Getting Started

### 1. Test the Commands

Try each command to understand how they work:

**Start with validation** (fastest):
```bash
/validate AI meeting note taker
```

**Then try discovery** (comprehensive):
```bash
/discover productivity tools for developers
```

**Experiment with direct invocation**:
```bash
/invoke-agent janus research trending SaaS ideas
```

---

### 2. Real-World Workflow

**Scenario: Finding Your First MicroSaaS**

**Step 1**: Broad discovery
```bash
/discover AI automation tools
```

**Step 2**: Validate top opportunity
```bash
/validate [specific idea from discovery]
```

**Step 3**: Deep dive with specific agents
```bash
/invoke-agent metis validate user needs for [idea]
/invoke-agent prometheus analyze competitors for [idea]
```

**Step 4**: Make decision based on Chronos viability score

---

## 📊 Command Comparison

| Command | Speed | Depth | Use Case |
|---------|-------|-------|----------|
| `/discover` | Thorough | Complete | Finding opportunities |
| `/validate` | Quick | Focused | Testing specific ideas |
| `/invoke-agent` | Varies | Custom | Specialized tasks |

---

## 🎯 Command Best Practices

### For /discover:
- **Be specific but not narrow**: "AI tools for content creators" > "all AI tools"
- **Focus on domains you understand**: Easier to validate findings
- **Trust the viability score**: >70 = strong signal to build
- **Review all agent outputs**: Each provides unique insights

### For /validate:
- **Clear, specific ideas**: "AI phone practice coach" > "AI coaching tool"
- **Use when time-constrained**: Get quick signal before deeper research
- **40+ score = proceed**: Strong enough to move forward
- **<30 score = pivot quickly**: Don't waste time on weak ideas

### For /invoke-agent:
- **Know your agents**: Review agent list in this README
- **Clear task description**: Specific instructions get better results
- **Reference playbooks**: Check agent playbooks for capabilities
- **Chain agents manually**: For custom workflows

---

## 🔧 Troubleshooting

### Command Not Found
- Ensure you're in the HermeticSaaS project directory
- Commands are project-specific slash commands
- Use exact syntax: `/discover topic` (no quotes needed)

### Unexpected Output
- Check if you provided the right arguments
- Review the command syntax above
- Try simpler/clearer phrasing

### Agent Confusion
- Use `/invoke-agent` to check specific agent capabilities
- Refer to agent playbooks in `.claude-agents/`
- Ensure task matches agent's domain

---

## 📚 Advanced Usage

### Chaining Commands

Run discovery, then validate top opportunities:
```bash
# First
/discover AI productivity

# Review results, then
/validate [top opportunity from discovery]

# If validated, deep dive
/invoke-agent metis create user personas for [idea]
/invoke-agent sol design architecture for [idea]
```

### Custom Workflows

Create your own workflows by chaining `/invoke-agent`:
```bash
# Custom market research workflow
/invoke-agent janus research [topic]
/invoke-agent echo synthesize findings from above
/invoke-agent metis validate top 3 problems
```

### Rapid Testing

Use `/validate` for multiple ideas quickly:
```bash
/validate idea 1
/validate idea 2
/validate idea 3
# Build the winner
```

---

## 🌟 Hermetic Principles in Commands

Every command embodies the six Hermetic principles:

**Functional**: Commands execute reliably, agents deliver results
**Formless**: Adapt to any domain or market
**Accurate**: Data-driven, validated findings
**Divine**: Focus on genuine value and user needs
**Elegant**: Simple commands, complex execution
**No Schemes**: Honest validation, no confirmation bias

---

## 🔮 Future Commands (Coming Soon)

Planned additions:
- `/build [idea]` - Full build pipeline
- `/ship [app]` - Deployment pipeline
- `/market [app]` - Marketing automation
- `/monetize [app]` - Payment setup
- `/microsaas [idea]` - Complete pipeline (idea → launched product)

---

## 📖 Learn More

**Agent Playbooks**:
- [Janus Playbook](../../01-discover/agent-playbooks/janus-playbook.md)
- [All Agents](../../.claude-agents/)

**Workflows**:
- [Full Pipeline](../workflows/full-pipeline.md)
- [Workflow System](../workflows/README.md)

**Framework**:
- [Main README](../../README.md)
- [Hermetic Principles](../../00-framework/HERMETIC_MICROSAAS_PRINCIPLES.md)
- [Complete Roadmap](../../00-framework/COMPLETE_ROADMAP.md)

---

**"Three commands to start. Thirty-eight agents to execute. Infinite MicroSaaS possibilities."**

*Trust the commands. Trust the agents. Trust the Hermetic way.*
