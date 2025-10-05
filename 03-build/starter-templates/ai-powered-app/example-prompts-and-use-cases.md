# Example Prompts and Use Cases

Production-ready prompt templates and real-world use cases for AI-powered SaaS applications.

## Table of Contents

1. [Customer Support](#customer-support)
2. [Content Generation](#content-generation)
3. [Code Assistant](#code-assistant)
4. [Data Analysis](#data-analysis)
5. [Document Processing](#document-processing)
6. [Email Automation](#email-automation)
7. [Research Assistant](#research-assistant)
8. [Sales & Marketing](#sales--marketing)
9. [Product Features](#product-features)
10. [Specialized Use Cases](#specialized-use-cases)

---

## Customer Support

### Use Case 1: AI Support Agent

**Description**: Answer customer questions using knowledge base (RAG)

**System Prompt**:
```typescript
const SUPPORT_AGENT = `You are a helpful customer support agent for [Product Name].

Your responsibilities:
- Answer questions accurately based on the provided documentation
- Be empathetic and professional
- Provide step-by-step solutions
- Escalate complex issues to human agents when needed
- Never make up information - only use the provided context

Guidelines:
- Address customers by name when available
- Use simple, clear language
- Include relevant links to documentation
- Offer follow-up help
- Thank customers for their patience

Tone: Friendly, professional, solution-oriented

If you cannot answer based on the provided context, say:
"I don't have enough information to answer that accurately. Let me connect you with a specialist who can help."`;
```

**Implementation**:
```typescript
export async function handleSupportQuery(
  question: string,
  userId: string,
  customerName?: string
) {
  // Retrieve relevant documentation
  const context = await retrieveContext(question, {
    topK: 5,
    threshold: 0.75,
    metadata: { category: 'support_docs' }
  });

  const messages = [
    { role: 'system', content: SUPPORT_AGENT },
    { role: 'system', content: `Knowledge Base:\n\n${context}` },
    { role: 'system', content: customerName ? `Customer name: ${customerName}` : '' },
    { role: 'user', content: question }
  ];

  return await streamChatCompletion({
    messages,
    model: 'gpt-3.5-turbo', // Cost-effective for support
    temperature: 0.7,
    maxTokens: 500
  });
}
```

**Example**:
```
User: "How do I reset my password?"

AI: "Hi Sarah! I'd be happy to help you reset your password. Here's how:

1. Go to the login page
2. Click "Forgot Password?" below the login button
3. Enter your email address
4. Check your email for a reset link (it should arrive within 5 minutes)
5. Click the link and create a new password

If you don't receive the email, please check your spam folder. Still having trouble? Let me know and I'll escalate this to our technical team.

Here's our detailed guide: [Link to password reset docs]

Is there anything else I can help you with?"
```

### Use Case 2: Ticket Classification

**Description**: Automatically classify and prioritize support tickets

**Prompt Template**:
```typescript
export const classifyTicket = (emailContent: string) => `
Classify this support ticket into categories and assign priority.

Email:
"""
${emailContent}
"""

Return JSON:
{
  "intent": "technical_support" | "billing" | "feature_request" | "bug_report" | "general_inquiry" | "cancellation",
  "priority": "critical" | "high" | "medium" | "low",
  "category": string,
  "sentiment": "positive" | "neutral" | "negative" | "urgent",
  "suggestedResponse": string,
  "requiresHumanReview": boolean
}

Examples:
- "Can't log in, tried 5 times" → technical_support, high, negative
- "Love the product! Quick question..." → general_inquiry, low, positive
- "Cancel my account NOW" → cancellation, high, negative, urgent
`;
```

**Implementation**:
```typescript
export async function autoClassifyTicket(email: {
  from: string;
  subject: string;
  body: string;
}) {
  const prompt = classifyTicket(`
From: ${email.from}
Subject: ${email.subject}

${email.body}
  `);

  const response = await createChatCompletion({
    messages: [
      { role: 'system', content: 'You are a ticket classification system.' },
      { role: 'user', content: prompt }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.2, // Low for consistency
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response);
}
```

---

## Content Generation

### Use Case 3: Blog Post Generator

**System Prompt**:
```typescript
const CONTENT_WRITER = `You are an expert content writer specializing in SaaS marketing.

Writing style:
- Clear, concise, and engaging
- Active voice preferred
- Short paragraphs (2-3 sentences)
- Use headers and bullet points
- Include relevant examples
- SEO-friendly but natural

Target audience: B2B decision makers (CTOs, product managers, founders)

Format: Markdown with proper structure

Guidelines:
- Start with a compelling hook
- Address pain points early
- Provide actionable insights
- Include data/statistics when relevant
- End with clear call-to-action
- Optimize for readability (grade 8-10)`;
```

**Implementation**:
```typescript
export async function generateBlogPost(params: {
  topic: string;
  keywords: string[];
  tone: 'professional' | 'casual' | 'technical';
  length: number; // words
}) {
  // Step 1: Generate outline
  const outline = await createChatCompletion({
    messages: [
      { role: 'system', content: CONTENT_WRITER },
      {
        role: 'user',
        content: `Create a detailed outline for a ${params.length}-word blog post about "${params.topic}". Include these keywords naturally: ${params.keywords.join(', ')}`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.8
  });

  // Step 2: Write full post
  const fullPost = await createChatCompletion({
    messages: [
      { role: 'system', content: CONTENT_WRITER },
      {
        role: 'user',
        content: `Write a complete blog post based on this outline. Tone: ${params.tone}\n\nOutline:\n${outline}`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: params.length * 1.5 // Approximate
  });

  return {
    outline,
    post: fullPost,
    wordCount: estimateWordCount(fullPost),
    readingTime: Math.ceil(estimateWordCount(fullPost) / 200)
  };
}
```

### Use Case 4: Social Media Generator

**Prompt Template**:
```typescript
export const generateSocialPost = (context: {
  platform: 'twitter' | 'linkedin' | 'facebook';
  topic: string;
  cta?: string;
  hashtags?: string[];
}) => {
  const limits = {
    twitter: '280 characters',
    linkedin: '3000 characters, but aim for 150-300 for best engagement',
    facebook: '250 characters or less for optimal reach'
  };

  return `Create an engaging ${context.platform} post about: ${context.topic}

Requirements:
- ${limits[context.platform]}
- Hook in first line
- Include emojis (2-3 max)
- ${context.cta ? `Call-to-action: ${context.cta}` : 'Include relevant CTA'}
- ${context.hashtags ? `Use hashtags: ${context.hashtags.join(' ')}` : 'Add 3-5 relevant hashtags'}
- Platform-appropriate tone (${context.platform === 'linkedin' ? 'professional' : 'casual and engaging'})

Return only the post text, ready to publish.`;
};
```

---

## Code Assistant

### Use Case 5: Code Generation

**System Prompt**:
```typescript
const CODE_ASSISTANT = `You are an expert software engineer specializing in TypeScript, React, and Node.js.

Code quality standards:
- Write clean, readable code
- Follow best practices
- Include error handling
- Add TypeScript types
- Write self-documenting code with clear variable names
- Include brief comments for complex logic
- Consider edge cases
- Optimize for performance when relevant

When generating code:
1. Understand the requirements fully
2. Propose the solution approach
3. Write the implementation
4. Explain key decisions
5. Suggest tests

Always provide working, production-ready code.`;
```

**Implementation**:
```typescript
export async function generateCode(request: {
  description: string;
  language: string;
  framework?: string;
  context?: string;
}) {
  const prompt = `
Generate ${request.language} code for: ${request.description}

${request.framework ? `Framework: ${request.framework}` : ''}
${request.context ? `Context:\n${request.context}` : ''}

Provide:
1. Implementation
2. Usage example
3. Tests (if applicable)
4. Any important notes
  `;

  return await createChatCompletion({
    messages: [
      { role: 'system', content: CODE_ASSISTANT },
      { role: 'user', content: prompt }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.2 // Lower for more deterministic code
  });
}
```

### Use Case 6: Code Review

**Prompt Template**:
```typescript
export const reviewCode = (code: string, language: string) => `
Review this ${language} code and provide feedback:

\`\`\`${language}
${code}
\`\`\`

Analyze:
1. **Bugs**: Any potential bugs or errors?
2. **Security**: Security vulnerabilities?
3. **Performance**: Performance issues or optimizations?
4. **Best Practices**: Violations of best practices?
5. **Readability**: Code clarity and maintainability?
6. **Testing**: What should be tested?

Format:
- List issues by severity (Critical, High, Medium, Low)
- Provide specific line references
- Suggest fixes
- Rate overall code quality (1-10)
`;
```

---

## Data Analysis

### Use Case 7: Data Insights Generator

**System Prompt**:
```typescript
const DATA_ANALYST = `You are an expert data analyst who helps teams understand their data.

Your approach:
- Identify key patterns and trends
- Highlight anomalies or outliers
- Provide actionable insights
- Explain statistical concepts in simple terms
- Recommend next steps

Communication style:
- Start with the most important finding
- Use plain language, avoid jargon
- Include specific numbers
- Visualize with markdown tables when helpful
- Suggest follow-up analyses`;
```

**Implementation**:
```typescript
export async function analyzeData(data: {
  dataset: any[];
  question?: string;
  context?: string;
}) {
  const dataPreview = JSON.stringify(data.dataset.slice(0, 10), null, 2);
  const stats = calculateBasicStats(data.dataset);

  const prompt = `
Analyze this dataset and provide insights.

Dataset preview (first 10 rows):
${dataPreview}

Summary statistics:
${JSON.stringify(stats, null, 2)}

${data.question ? `Specific question: ${data.question}` : 'Provide general insights and recommendations.'}

${data.context ? `Context: ${data.context}` : ''}

Provide:
1. Key findings (3-5 bullet points)
2. Notable patterns or anomalies
3. Recommendations
4. Suggested visualizations
5. Questions for further investigation
  `;

  return await createChatCompletion({
    messages: [
      { role: 'system', content: DATA_ANALYST },
      { role: 'user', content: prompt }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.3
  });
}
```

### Use Case 8: SQL Query Generator

**Prompt Template**:
```typescript
export const generateSQL = (params: {
  request: string;
  schema: string;
  dialect?: 'postgresql' | 'mysql' | 'sqlite';
}) => `
Generate a ${params.dialect || 'PostgreSQL'} query for: ${params.request}

Database schema:
${params.schema}

Requirements:
- Write efficient, optimized query
- Use proper indexing hints if needed
- Include comments explaining complex logic
- Handle NULL values appropriately
- Use meaningful aliases
- Format for readability

Return:
1. The SQL query
2. Explanation of what it does
3. Sample output description
4. Performance considerations
`;
```

---

## Document Processing

### Use Case 9: Document Summarizer

**Implementation**:
```typescript
export async function summarizeDocument(params: {
  documentId: string;
  summaryType: 'brief' | 'detailed' | 'executive';
  maxWords: number;
}) {
  // Retrieve document chunks
  const chunks = await getDocumentChunks(params.documentId);
  const fullText = chunks.map(c => c.text).join('\n\n');

  const summaryStyles = {
    brief: 'Create a concise summary highlighting only the main points.',
    detailed: 'Create a comprehensive summary covering all important details.',
    executive: 'Create an executive summary for business leaders, focusing on key takeaways and decisions.'
  };

  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'You are an expert at analyzing and summarizing documents.'
      },
      {
        role: 'user',
        content: `${summaryStyles[params.summaryType]}

Maximum length: ${params.maxWords} words

Document:
${fullText}

Summary:`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.3
  });

  return response;
}
```

### Use Case 10: Q&A Over Documents (RAG)

**Implementation**:
```typescript
export async function answerFromDocuments(params: {
  question: string;
  documentIds?: string[];
  userId: string;
}) {
  // Retrieve relevant context from documents
  const context = await retrieveContext(params.question, {
    topK: 5,
    threshold: 0.7,
    userId: params.userId,
    documentIds: params.documentIds
  });

  if (!context) {
    return "I couldn't find relevant information in your documents to answer that question.";
  }

  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `Answer questions based only on the provided document context.

Rules:
- Only use information from the context
- Cite specific sections when possible
- If the answer isn't in the context, say so
- Be precise and factual
- Quote directly when appropriate`
      },
      {
        role: 'system',
        content: `Context from documents:\n\n${context}`
      },
      {
        role: 'user',
        content: params.question
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.2 // Low for factual accuracy
  });

  return response;
}
```

---

## Email Automation

### Use Case 11: Email Reply Generator

**Prompt Template**:
```typescript
export const generateEmailReply = (params: {
  originalEmail: string;
  tone: 'professional' | 'friendly' | 'apologetic';
  keyPoints: string[];
}) => `
Generate a reply to this email:

"""
${params.originalEmail}
"""

Tone: ${params.tone}

Key points to address:
${params.keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Requirements:
- Professional email format
- Appropriate greeting and closing
- Clear and concise
- Address all points
- Maintain ${params.tone} tone throughout

Return only the email body, ready to send.
`;
```

### Use Case 12: Email Subject Line Generator

**Implementation**:
```typescript
export async function generateSubjectLines(emailBody: string, count = 5) {
  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'You are an expert email marketer who writes compelling subject lines.'
      },
      {
        role: 'user',
        content: `Generate ${count} different subject lines for this email:

${emailBody}

Requirements:
- Under 60 characters
- Compelling and clear
- Action-oriented
- No clickbait
- Variety of approaches (urgency, curiosity, value, etc.)

Return as JSON array: ["subject 1", "subject 2", ...]`
      }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.9, // Higher for creativity
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response).subjects;
}
```

---

## Research Assistant

### Use Case 13: Literature Review

**Implementation**:
```typescript
export async function researchTopic(params: {
  topic: string;
  documents: string[]; // Document IDs
  focusAreas?: string[];
}) {
  // Retrieve all relevant information
  const contexts = await Promise.all(
    (params.focusAreas || [params.topic]).map(area =>
      retrieveContext(area, {
        topK: 10,
        documentIds: params.documents
      })
    )
  );

  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a research assistant conducting a literature review.

Your output should:
- Synthesize information from multiple sources
- Identify key themes and patterns
- Note contradictions or debates
- Highlight gaps in the literature
- Use academic tone
- Cite sources when available`
      },
      {
        role: 'user',
        content: `Research topic: ${params.topic}

${params.focusAreas ? `Focus areas:\n${params.focusAreas.map((a, i) => `${i + 1}. ${a}`).join('\n')}` : ''}

Source material:
${contexts.map((c, i) => `\n--- Source ${i + 1} ---\n${c}`).join('\n')}

Provide a comprehensive research summary.`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.4,
    maxTokens: 2000
  });

  return response;
}
```

---

## Sales & Marketing

### Use Case 14: Sales Email Personalization

**Implementation**:
```typescript
export async function personalizeSalesEmail(params: {
  template: string;
  prospectInfo: {
    name: string;
    company: string;
    industry: string;
    painPoints?: string[];
    recentActivity?: string;
  };
}) {
  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a sales expert who personalizes outreach emails.

Personalization strategy:
- Reference prospect's specific situation
- Address relevant pain points
- Show understanding of their industry
- Mention recent company activity if available
- Keep it concise (under 150 words)
- Natural, not robotic
- Clear call-to-action`
      },
      {
        role: 'user',
        content: `Personalize this email template:

Template:
${params.template}

Prospect information:
- Name: ${params.prospectInfo.name}
- Company: ${params.prospectInfo.company}
- Industry: ${params.prospectInfo.industry}
${params.prospectInfo.painPoints ? `- Pain points: ${params.prospectInfo.painPoints.join(', ')}` : ''}
${params.prospectInfo.recentActivity ? `- Recent activity: ${params.prospectInfo.recentActivity}` : ''}

Return only the personalized email, ready to send.`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.7
  });

  return response;
}
```

### Use Case 15: Landing Page Copy

**Prompt Template**:
```typescript
export const generateLandingPageCopy = (params: {
  product: string;
  targetAudience: string;
  mainBenefit: string;
  features: string[];
  cta: string;
}) => `
Write compelling landing page copy for: ${params.product}

Target audience: ${params.targetAudience}
Main benefit: ${params.mainBenefit}

Features:
${params.features.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Call-to-action: ${params.cta}

Sections needed:
1. **Hero headline** (10 words max) - Grab attention immediately
2. **Subheadline** (20 words max) - Clarify the main benefit
3. **Problem statement** (2-3 sentences) - Agitate the pain point
4. **Solution** (3-4 sentences) - Position product as solution
5. **Features/Benefits** (3 bullet points) - Value-focused
6. **Social proof** (1 sentence placeholder)
7. **Final CTA** (1 sentence) - Strong, action-oriented

Writing guidelines:
- Clear, benefit-driven copy
- Active voice
- Short sentences
- Address objections
- Create urgency
- Use power words
- Scannable format

Return as markdown with headers.
`;
```

---

## Product Features

### Use Case 16: Smart Search with AI

**Implementation**:
```typescript
export async function intelligentSearch(query: string, filters?: any) {
  // Step 1: Expand query with synonyms and related terms
  const expandedQuery = await expandSearchQuery(query);

  // Step 2: Hybrid search (vector + keyword)
  const results = await hybridSearch(expandedQuery, {
    vectorWeight: 0.7,
    keywordWeight: 0.3,
    filters,
    topK: 20
  });

  // Step 3: Re-rank by relevance
  const reranked = await rerankResults(query, results);

  // Step 4: Generate summary for top results
  const summary = await summarizeResults(query, reranked.slice(0, 5));

  return {
    results: reranked,
    summary,
    suggestions: await generateSearchSuggestions(query)
  };
}

async function expandSearchQuery(query: string): Promise<string> {
  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: 'Expand search queries with synonyms and related terms.'
      },
      {
        role: 'user',
        content: `Original query: "${query}"\n\nProvide an expanded search query that includes synonyms and related terms. Return only the expanded query.`
      }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.3
  });

  return response;
}
```

### Use Case 17: Content Recommendations

**Implementation**:
```typescript
export async function generateRecommendations(params: {
  userId: string;
  currentItem: any;
  userHistory: any[];
  count?: number;
}) {
  // Get user's interaction history
  const userContext = summarizeUserBehavior(params.userHistory);

  // Generate contextual recommendations
  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a recommendation engine. Suggest relevant content based on user behavior and current item.`
      },
      {
        role: 'user',
        content: `Current item: ${JSON.stringify(params.currentItem)}

User context: ${userContext}

Generate ${params.count || 5} recommendations with explanations.

Return as JSON:
{
  "recommendations": [
    {
      "id": "item_id",
      "title": "Item title",
      "reason": "Why this is recommended",
      "relevanceScore": 0.95
    }
  ]
}`
      }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.5,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response);
}
```

---

## Specialized Use Cases

### Use Case 18: Contract Analysis

**Implementation**:
```typescript
export async function analyzeContract(contractText: string) {
  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `You are a legal AI assistant that analyzes contracts.

Extract:
- Key terms and conditions
- Important dates and deadlines
- Payment terms
- Termination clauses
- Liability limitations
- Red flags or unusual terms

Provide clear, non-legal language summaries.
Disclaimer: This is not legal advice.`
      },
      {
        role: 'user',
        content: `Analyze this contract:\n\n${contractText}`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.2
  });

  return response;
}
```

### Use Case 19: Meeting Notes & Action Items

**Implementation**:
```typescript
export async function processMeetingTranscript(transcript: string) {
  const response = await createChatCompletion({
    messages: [
      {
        role: 'system',
        content: `Process meeting transcripts and extract structured information.

Extract:
1. **Summary**: Brief overview (2-3 sentences)
2. **Key Discussion Points**: Main topics discussed
3. **Decisions Made**: Clear decisions and outcomes
4. **Action Items**: Who needs to do what by when
5. **Follow-up Questions**: Unresolved questions
6. **Next Steps**: What happens next

Format as clear, scannable markdown.`
      },
      {
        role: 'user',
        content: `Meeting transcript:\n\n${transcript}`
      }
    ],
    model: 'gpt-4-turbo-preview',
    temperature: 0.3
  });

  return response;
}
```

### Use Case 20: Sentiment Analysis at Scale

**Implementation**:
```typescript
export async function analyzeSentimentBatch(items: Array<{
  id: string;
  text: string;
}>) {
  // Process in batches to optimize costs
  const batchSize = 20;
  const results = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);

    const response = await createChatCompletion({
      messages: [
        {
          role: 'system',
          content: `Analyze sentiment for multiple text items. Return JSON array.`
        },
        {
          role: 'user',
          content: `Analyze sentiment for these items:

${batch.map(item => `ID: ${item.id}\nText: ${item.text}\n`).join('\n---\n')}

Return JSON:
{
  "results": [
    {
      "id": "item_id",
      "sentiment": "positive" | "negative" | "neutral",
      "confidence": 0.95,
      "emotions": ["joy", "excitement"],
      "keyPhrases": ["loved it", "great experience"]
    }
  ]
}`
        }
      ],
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    results.push(...JSON.parse(response).results);

    // Rate limiting
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
```

---

## Prompt Engineering Best Practices

### 1. Be Specific and Clear

**Bad**:
```
Write something about AI
```

**Good**:
```
Write a 500-word blog post explaining RAG (Retrieval Augmented Generation)
to software developers. Include:
- Definition and key concepts
- How it differs from fine-tuning
- Real-world use cases
- Implementation overview
Tone: Technical but accessible
```

### 2. Provide Examples (Few-Shot Learning)

```typescript
const prompt = `
Classify customer feedback as feature request, bug report, or praise.

Examples:
"The app crashes when I upload files" → bug_report
"Would love to see dark mode!" → feature_request
"Amazing product, saved me hours!" → praise

Now classify: "${userFeedback}"
`;
```

### 3. Set Constraints

```typescript
const prompt = `
Generate product description.

Constraints:
- Maximum 150 words
- Include these keywords: [eco-friendly, durable, affordable]
- Target audience: millennials
- Tone: casual and inspiring
- Include 1 call-to-action
- No superlatives (best, greatest, etc.)
`;
```

### 4. Use Structured Output

```typescript
const prompt = `
Analyze this customer review.

Return JSON:
{
  "sentiment": "positive" | "negative" | "neutral",
  "rating": 1-5,
  "topics": ["topic1", "topic2"],
  "actionable": true | false,
  "summary": "brief summary"
}
`;
```

### 5. Chain Prompts for Complex Tasks

```typescript
// Step 1: Extract key info
const extraction = await extractKeyInfo(rawData);

// Step 2: Analyze extracted info
const analysis = await analyzeData(extraction);

// Step 3: Generate insights
const insights = await generateInsights(analysis);

// Step 4: Format for presentation
const report = await formatReport(insights);
```

---

## Cost Optimization Patterns

### Pattern 1: Cache Common Queries

```typescript
export async function optimizedQuery(query: string) {
  // Check cache first
  const cached = await getCachedResponse(query);
  if (cached) return cached;

  // Generate new response
  const response = await createChatCompletion({ ... });

  // Cache for future
  await cacheResponse(query, response, 3600);

  return response;
}
```

### Pattern 2: Use Appropriate Models

```typescript
const modelSelection = {
  simple: 'gpt-3.5-turbo',      // Classification, simple Q&A
  moderate: 'gpt-4-turbo',       // Content generation, analysis
  complex: 'gpt-4',              // Reasoning, creative writing
  summarization: 'gpt-3.5-turbo' // Most summaries
};
```

### Pattern 3: Batch Processing

```typescript
// Instead of 100 individual requests
for (const item of items) {
  await processItem(item); // Expensive!
}

// Batch into single request
await processBatch(items.slice(0, 20)); // Much cheaper!
```

---

## Testing Prompts

### Test Template

```typescript
describe('Prompt: Customer Support Classification', () => {
  const testCases = [
    {
      input: "Can't log in to my account",
      expected: { category: 'technical_support', priority: 'high' }
    },
    {
      input: "Love your product!",
      expected: { category: 'feedback', priority: 'low' }
    }
  ];

  testCases.forEach(({ input, expected }) => {
    it(`should classify: "${input}"`, async () => {
      const result = await classifyTicket(input);
      expect(result.category).toBe(expected.category);
      expect(result.priority).toBe(expected.priority);
    });
  });
});
```

---

## Conclusion

These prompts and use cases cover the most common AI-powered features in SaaS applications. Key principles:

1. **Be specific** in your instructions
2. **Provide context** when needed
3. **Use examples** to guide the model
4. **Set clear constraints**
5. **Optimize for cost** with caching and model selection
6. **Test thoroughly** with various inputs
7. **Iterate** based on real results

Start with these templates and customize for your specific use case. Monitor performance and costs, and refine prompts based on user feedback.

---

**Need more examples?** Check the `/lib/ai/prompts/` directory for additional templates and the comprehensive README.md for integration patterns.
