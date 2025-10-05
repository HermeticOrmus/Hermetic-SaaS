# Claude Orchestration Workflows

> **Automated agent chains for complete MicroSaaS execution**

This directory contains workflow definitions that chain Hermetic Agents together for complex, multi-phase operations. Each workflow represents a complete process from start to finish.

---

## 🌊 Workflow Philosophy

**Agent Chaining**: Complex tasks are broken down into agent-specific steps that flow seamlessly from one to another.

**Context Preservation**: Each agent receives context from previous agents to make informed decisions.

**Error Handling**: Workflows include fallback strategies and validation at each step.

**Parallel Execution**: Where possible, agents work in parallel to maximize speed.

---

## 📂 Available Workflows

### Core Workflows

#### 1. `discover.md` - Discovery Pipeline
**Purpose**: Find and validate MicroSaaS opportunities

**Agent Chain**: Janus → Echo → Metis → Prometheus → Chronos

**Usage**:
```bash
/discover "[topic/domain]"
```

**Output**: Validated opportunity with viability score

---

#### 2. `build.md` - Build Pipeline
**Purpose**: Design and develop MicroSaaS from scratch

**Agent Chain**: Sol → Iris → Uranus → Jupiter → Venus → Eros → Mars

**Usage**:
```bash
/build-microsaas "[app name]" "[description]"
```

**Output**: Fully functional MicroSaaS application

---

#### 3. `ship.md` - Deployment Pipeline
**Purpose**: Test, deploy, and launch MicroSaaS

**Agent Chain**: Mars → Callisto → Ceres → Atlas

**Usage**:
```bash
/ship "[app name]"
```

**Output**: Production deployment + launch execution

---

#### 4. `market.md` - Marketing Pipeline
**Purpose**: Create and execute marketing strategy

**Agent Chain**: Psyche → Eris → Fortuna → Calliope → Juno → Vesta

**Usage**:
```bash
/market "[app name]"
```

**Output**: Complete marketing campaign live

---

#### 5. `full-pipeline.md` - Complete MicroSaaS Pipeline
**Purpose**: Execute entire lifecycle from idea to launched product

**Agent Chain**: All agents in sequence across all phases

**Usage**:
```bash
/microsaas "[idea description]"
```

**Output**: Fully launched, marketed, and monetized MicroSaaS

---

### Specialized Workflows

#### 6. `ai-integrate.md` - AI Integration Workflow
**Purpose**: Add AI capabilities to any application

**Agent Chain**: Uranus → Jupiter → Mars

**Usage**:
```bash
/ai-integrate "[use case]" "[app name]"
```

---

#### 7. `optimize.md` - Optimization Workflow
**Purpose**: Improve performance, conversion, and retention

**Agent Chain**: Luna → Europa → Hygeia → Io → Rhea

**Usage**:
```bash
/optimize "[app name]" "[focus area]"
```

---

#### 8. `scale.md` - Scaling Workflow
**Purpose**: Prepare application for growth

**Agent Chain**: Sol → Neptune → Vulcan → Ceres

**Usage**:
```bash
/scale "[app name]" "[target load]"
```

---

## 🔧 Workflow Structure

Each workflow file contains:

### 1. Workflow Metadata
```yaml
name: [Workflow Name]
description: [What it does]
estimated_duration: [Time estimate]
agents_involved: [List of agents]
```

### 2. Agent Sequence
```yaml
sequence:
  - agent: [Agent Name]
    role: [What they do]
    input: [What they receive]
    output: [What they produce]
    success_criteria: [When to proceed]
```

### 3. Execution Commands
```bash
# Example command formats
```

### 4. Error Handling
```yaml
error_handling:
  - condition: [Error condition]
    fallback: [Fallback agent/action]
```

---

## 🚀 Creating Custom Workflows

### Step 1: Define Your Process
Map out the complete process:
1. What's the goal?
2. What steps are needed?
3. Which agents handle which steps?
4. What's the output of each step?

### Step 2: Identify Agent Chain
Select agents based on their expertise:
- Discovery: Janus, Echo, Metis
- Architecture: Sol, Neptune
- Development: Iris, Jupiter, Uranus, Pallas
- Design: Venus, Hera, Eros, Titan
- Testing: Mars, Ganymede, Europa, Callisto
- Deployment: Ceres, Vulcan
- Marketing: Psyche, Eris, Fortuna, Calliope
- Operations: Hygeia, Chiron, Plutus

### Step 3: Define Handoffs
Specify what each agent passes to the next:
```yaml
Agent A output:
  - item_1
  - item_2

Agent B input (receives from Agent A):
  - item_1
  - item_2
```

### Step 4: Create Workflow File
Use the template: `.claude/workflows/WORKFLOW_TEMPLATE.md`

---

## 📊 Workflow Execution Patterns

### Sequential Execution
Agents execute one after another, each building on previous work:
```
A → B → C → D
```

### Parallel Execution
Multiple agents work simultaneously:
```
     → B →
A →  → C →  → E
     → D →
```

### Conditional Execution
Workflow branches based on conditions:
```
      → B → D
A →
      → C → E
```

### Loop Execution
Agents iterate until success criteria met:
```
A → B → C → [Check] → [Pass: D] or [Fail: Back to B]
```

---

## 🎯 Workflow Best Practices

### 1. Clear Inputs/Outputs
Every agent must have:
- Clear input requirements
- Defined output format
- Success criteria

### 2. Context Preservation
Pass context forward:
```yaml
agent_1_output:
  context:
    problem: "User authentication issues"
    goal: "Secure auth system"
    constraints: ["Must support OAuth", "Under $100/mo"]

agent_2_input:
  receives: agent_1_output.context
  uses: context to make decisions
```

### 3. Error Recovery
Plan for failures:
```yaml
if: Mars finds critical bugs
then: Loop back to Jupiter (feature dev)
else: Proceed to Callisto (analysis)
```

### 4. Validation Gates
Check quality at each stage:
```yaml
validation:
  - agent: Mars
    validates: Jupiter's code
    gate: "All tests pass"
    action_if_fail: "Return to Jupiter with issues"
```

---

## 🔄 Workflow Iteration

### After Each Workflow Run

1. **Capture Learnings**
   - What worked well?
   - What was inefficient?
   - Which agents struggled?

2. **Update Workflows**
   - Refine agent prompts
   - Adjust sequence
   - Improve handoffs

3. **Optimize**
   - Identify parallel opportunities
   - Remove redundant steps
   - Speed up bottlenecks

---

## 📚 Workflow Library

### By Phase

**Phase 1 (Discover)**:
- `discover.md` - Full discovery
- `trend-research.md` - Trend analysis only
- `validate-idea.md` - Quick validation

**Phase 2 (Learn)**:
- `learn-stack.md` - Tech recommendations
- `skill-gap-analysis.md` - Identify learning needs

**Phase 3 (Build)**:
- `build.md` - Full build pipeline
- `rapid-prototype.md` - Quick MVP
- `ai-integrate.md` - Add AI features

**Phase 4 (Ship)**:
- `ship.md` - Full deployment
- `quick-deploy.md` - Fast deployment

**Phase 5 (Market)**:
- `market.md` - Full marketing
- `viral-campaign.md` - Viral focus
- `content-blast.md` - Content generation

**Phase 6 (Sell)**:
- `monetize.md` - Payment setup
- `optimize-pricing.md` - Pricing optimization

**Phase 7 (Maintain)**:
- `maintain.md` - Full operations setup
- `monitor.md` - Monitoring only
- `support-setup.md` - Support systems

**Phase 8 (Evolve)**:
- `evolve.md` - Full improvement cycle
- `ab-test.md` - Experimentation
- `refactor.md` - Code improvement

---

## 🎮 Using Workflows

### Method 1: Command Execution
```bash
/microsaas "Build an AI tool for phone anxiety practice"
```

### Method 2: Manual Agent Invocation
```bash
# Follow workflow manually
Janus, research phone anxiety app opportunities
Echo, analyze demand for phone practice tools
Metis, validate user needs for anxiety apps
# ... continue through workflow
```

### Method 3: Hybrid Approach
```bash
# Start automated
/discover "phone anxiety apps"

# Review results, then continue manually or automated
/build-microsaas "PhonePractice" "AI coach for phone anxiety"
```

---

## 🌟 Master Workflows

### The One-Command Launch
```bash
/microsaas "idea"
```

**What happens**:
1. Discovery (2-3 days): Janus → Echo → Metis
2. Learning (1 day): Prometheus → Saturn
3. Building (3-4 days): Sol → Iris → Uranus → Jupiter → Venus
4. Shipping (1 day): Mars → Callisto → Ceres → Atlas
5. Marketing (ongoing): Psyche → Eris → Fortuna → Calliope
6. Monetization (1 day): Plutus
7. Operations (1 day): Hygeia → Chiron → Vulcan

**Total time**: 7-14 days from idea to launched MicroSaaS

---

## 📖 Workflow Documentation

Each workflow file should include:

1. **Purpose**: What it accomplishes
2. **Prerequisites**: What's needed before starting
3. **Agent Chain**: Complete sequence
4. **Step-by-Step**: Detailed execution
5. **Deliverables**: What you get
6. **Success Criteria**: How to know it worked
7. **Troubleshooting**: Common issues
8. **Examples**: Real use cases

---

## 🔮 Future Workflows

Planned additions:
- `acquisition.md` - Evaluate acquisition targets
- `exit.md` - Prepare for sale/exit
- `partnership.md` - Evaluate partnerships
- `internationalize.md` - Multi-language/region
- `mobile-first.md` - Mobile-specific build
- `no-code.md` - No-code build pipeline

---

**"Workflows are the pathways through which Hermetic Agents orchestrate creation. Trust the flow, trust the sequence, trust the result."**

---

*This README is a living document. Update as workflows evolve.*

**Last Updated**: [Date]
**Total Workflows**: 8+ (and growing)
