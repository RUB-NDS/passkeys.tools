/* Search module for history entries */

// Token types for the lexer
const TokenType = {
    FIELD: "FIELD",
    OPERATOR: "OPERATOR",
    VALUE: "VALUE",
    AND: "AND",
    OR: "OR",
    NOT: "NOT",
    LPAREN: "LPAREN",
    RPAREN: "RPAREN",
    EOF: "EOF"
}

// Lexer to tokenize search queries
class Lexer {
    constructor(input) {
        this.input = input
        this.position = 0
        this.tokens = []
    }

    tokenize() {
        while (this.position < this.input.length) {
            this.skipWhitespace()

            if (this.position >= this.input.length) break

            const char = this.input[this.position]

            if (char === "(") {
                this.tokens.push({ type: TokenType.LPAREN, value: "(" })
                this.position++
            } else if (char === ")") {
                this.tokens.push({ type: TokenType.RPAREN, value: ")" })
                this.position++
            } else if (char === '"' || char === "'") {
                this.readQuotedString(char)
            } else if (this.isOperatorStart()) {
                this.readOperator()
            } else {
                this.readWord()
            }
        }

        this.tokens.push({ type: TokenType.EOF, value: "" })
        return this.tokens
    }

    skipWhitespace() {
        while (this.position < this.input.length && /\s/.test(this.input[this.position])) {
            this.position++
        }
    }

    isOperatorStart() {
        const twoCharOps = ["==", "!=", ">=", "<=", "~="]
        const oneCharOps = ["=", ">", "<", ":", "~"]

        if (this.position + 1 < this.input.length) {
            const twoChar = this.input.substring(this.position, this.position + 2)
            if (twoCharOps.includes(twoChar)) return true
        }

        return oneCharOps.includes(this.input[this.position])
    }

    readOperator() {
        const twoCharOps = ["==", "!=", ">=", "<=", "~="]

        if (this.position + 1 < this.input.length) {
            const twoChar = this.input.substring(this.position, this.position + 2)
            if (twoCharOps.includes(twoChar)) {
                this.tokens.push({ type: TokenType.OPERATOR, value: twoChar })
                this.position += 2
                return
            }
        }

        this.tokens.push({ type: TokenType.OPERATOR, value: this.input[this.position] })
        this.position++
    }

    readQuotedString(quoteChar) {
        this.position++ // Skip opening quote
        let value = ""

        while (this.position < this.input.length && this.input[this.position] !== quoteChar) {
            if (this.input[this.position] === "\\" && this.position + 1 < this.input.length) {
                this.position++ // Skip backslash
                value += this.input[this.position]
            } else {
                value += this.input[this.position]
            }
            this.position++
        }

        if (this.position < this.input.length) {
            this.position++ // Skip closing quote
        }

        this.tokens.push({ type: TokenType.VALUE, value })
    }

    readWord() {
        let value = ""

        while (this.position < this.input.length &&
               !/[\s()"]/.test(this.input[this.position]) &&
               !this.isOperatorStart()) {
            value += this.input[this.position]
            this.position++
        }

        // Check if it's a logical operator
        const upperValue = value.toUpperCase()
        if (upperValue === "AND" || upperValue === "&&") {
            this.tokens.push({ type: TokenType.AND, value: "AND" })
        } else if (upperValue === "OR" || upperValue === "||") {
            this.tokens.push({ type: TokenType.OR, value: "OR" })
        } else if (upperValue === "NOT" || upperValue === "!") {
            this.tokens.push({ type: TokenType.NOT, value: "NOT" })
        } else if (this.tokens.length > 0 && this.tokens[this.tokens.length - 1].type === TokenType.OPERATOR) {
            // If previous token is an operator, this is a value
            this.tokens.push({ type: TokenType.VALUE, value })
        } else {
            // Otherwise, it might be a field name
            this.tokens.push({ type: TokenType.FIELD, value })
        }
    }
}

// Parser to build an AST from tokens
class Parser {
    constructor(tokens) {
        this.tokens = tokens
        this.position = 0
    }

    parse() {
        return this.parseExpression()
    }

    currentToken() {
        return this.tokens[this.position]
    }

    consumeToken(expectedType) {
        const token = this.currentToken()
        if (token.type !== expectedType) {
            throw new Error(`Expected ${expectedType} but got ${token.type}`)
        }
        this.position++
        return token
    }

    parseExpression() {
        return this.parseOr()
    }

    parseOr() {
        let left = this.parseAnd()

        while (this.currentToken().type === TokenType.OR) {
            this.position++
            const right = this.parseAnd()
            left = { type: "OR", left, right }
        }

        return left
    }

    parseAnd() {
        let left = this.parseNot()

        while (this.currentToken().type === TokenType.AND) {
            this.position++
            const right = this.parseNot()
            left = { type: "AND", left, right }
        }

        // Implicit AND when no operator is specified
        while (this.currentToken().type === TokenType.FIELD ||
               this.currentToken().type === TokenType.LPAREN) {
            const right = this.parseNot()
            left = { type: "AND", left, right }
        }

        return left
    }

    parseNot() {
        if (this.currentToken().type === TokenType.NOT) {
            this.position++
            return { type: "NOT", operand: this.parsePrimary() }
        }
        return this.parsePrimary()
    }

    parsePrimary() {
        const token = this.currentToken()

        if (token.type === TokenType.LPAREN) {
            this.position++
            const expr = this.parseExpression()
            this.consumeToken(TokenType.RPAREN)
            return expr
        }

        if (token.type === TokenType.FIELD) {
            const field = token.value
            this.position++

            if (this.currentToken().type === TokenType.OPERATOR) {
                const op = this.consumeToken(TokenType.OPERATOR)
                const value = this.consumeToken(TokenType.VALUE)
                return { type: "COMPARISON", field, operator: op.value, value: value.value }
            } else {
                // Field without operator, treat as text search
                return { type: "TEXT_SEARCH", value: field }
            }
        }

        if (token.type === TokenType.VALUE) {
            this.position++
            return { type: "TEXT_SEARCH", value: token.value }
        }

        throw new Error(`Unexpected token: ${token.type}`)
    }
}

// Evaluator to execute queries against history entries
class QueryEvaluator {
    constructor(ast) {
        this.ast = ast
    }

    evaluate(entry) {
        return this.evaluateNode(this.ast, entry)
    }

    evaluateNode(node, entry) {
        switch (node.type) {
            case "AND":
                return this.evaluateNode(node.left, entry) && this.evaluateNode(node.right, entry)

            case "OR":
                return this.evaluateNode(node.left, entry) || this.evaluateNode(node.right, entry)

            case "NOT":
                return !this.evaluateNode(node.operand, entry)

            case "COMPARISON":
                return this.evaluateComparison(node, entry)

            case "TEXT_SEARCH":
                return this.evaluateTextSearch(node.value, entry)

            default:
                return false
        }
    }

    evaluateComparison(node, entry) {
        const fieldValue = this.getFieldValue(node.field, entry)
        const compareValue = node.value

        switch (node.operator) {
            case "==":
            case "=":
                return String(fieldValue).toLowerCase() === compareValue.toLowerCase()

            case "!=":
                return String(fieldValue).toLowerCase() !== compareValue.toLowerCase()

            case ">":
                return fieldValue > compareValue

            case ">=":
                return fieldValue >= compareValue

            case "<":
                return fieldValue < compareValue

            case "<=":
                return fieldValue <= compareValue

            case ":":
            case "~":
            case "~=":
                return String(fieldValue).toLowerCase().includes(compareValue.toLowerCase())

            default:
                return false
        }
    }

    evaluateTextSearch(searchText, entry) {
        const searchLower = searchText.toLowerCase()

        // Search in all string fields
        const searchableFields = [
            entry.mode,
            entry.type,
            entry.status,
            entry.origin,
            entry.credentialId,
            entry.key,
            entry.userHandle,
            entry.modification,
            JSON.stringify(entry.info),
            JSON.stringify(entry.request),
            JSON.stringify(entry.response)
        ]

        return searchableFields.some(field =>
            field && String(field).toLowerCase().includes(searchLower)
        )
    }

    getFieldValue(fieldName, entry) {
        const fieldLower = fieldName.toLowerCase()

        // Direct field mapping
        const fieldMap = {
            "timestamp": entry.timestamp,
            "mode": entry.mode,
            "type": entry.type,
            "status": entry.status,
            "origin": entry.origin,
            "credentialid": entry.credentialId,
            "credential": entry.credentialId,
            "key": entry.key,
            "userhandle": entry.userHandle,
            "user": entry.userHandle,
            "modification": entry.modification,
            "info": JSON.stringify(entry.info),
            "request": JSON.stringify(entry.request),
            "response": JSON.stringify(entry.response)
        }

        return fieldMap[fieldLower] || ""
    }
}

// Main search function
export function searchHistory(entries, query) {
    if (!query || query.trim() === "") {
        return entries
    }

    try {
        const lexer = new Lexer(query)
        const tokens = lexer.tokenize()

        const parser = new Parser(tokens)
        const ast = parser.parse()

        const evaluator = new QueryEvaluator(ast)

        return entries.filter(entry => evaluator.evaluate(entry))
    } catch (error) {
        console.error("Search query error:", error)
        // On error, fall back to simple text search
        const searchLower = query.toLowerCase()
        return entries.filter(entry => {
            const searchableText = JSON.stringify(entry).toLowerCase()
            return searchableText.includes(searchLower)
        })
    }
}

// Export search syntax help
export const searchSyntax = {
    title: "Search Syntax",
    description: "Use the following syntax to search history entries:",
    examples: [
        { query: 'status == "resolved"', description: "Find entries with resolved status" },
        { query: 'type == "create" AND origin : "example.com"', description: "Find create operations from example.com" },
        { query: 'credentialId != "" AND modification != "None"', description: "Find modified entries with credentials" },
        { query: '"excludeCredentials"', description: "Search for text in any field" },
        { query: 'status == "rejected" OR status == "dismissed"', description: "Find rejected or dismissed entries" },
        { query: 'NOT (status == "resolved")', description: "Find all non-resolved entries" },
        { query: 'timestamp > 1700000000000', description: "Find entries after a specific timestamp" }
    ],
    operators: [
        { op: "==, =", description: "Equals (case-insensitive)" },
        { op: "!=", description: "Not equals" },
        { op: ":, ~, ~=", description: "Contains (case-insensitive)" },
        { op: ">", description: "Greater than" },
        { op: ">=", description: "Greater than or equal" },
        { op: "<", description: "Less than" },
        { op: "<=", description: "Less than or equal" }
    ],
    fields: [
        "timestamp", "mode", "type", "status", "origin",
        "credentialId", "key", "userHandle", "modification",
        "info", "request", "response"
    ],
    logicalOperators: ["AND, &&", "OR, ||", "NOT, !"],
    notes: [
        "Use quotes for values with spaces",
        "Field names are case-insensitive",
        "Parentheses can be used for grouping"
    ]
}
