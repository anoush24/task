import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description:
        "A scalable REST API with JWT authentication, role-based access control, and task management. Built with Node.js, Express, and MongoDB.",
      contact: {
        name: "API Support",
        email: "support@taskflow.dev",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT access token obtained from /api/v1/auth/login",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "64abc123..." },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", example: "john@example.com" },
            role: { type: "string", enum: ["user", "admin"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            _id: { type: "string", example: "64abc456..." },
            title: { type: "string", example: "Fix login bug" },
            description: { type: "string", example: "Button unresponsive on mobile" },
            status: { type: "string", enum: ["todo", "in-progress", "done"] },
            priority: { type: "string", enum: ["low", "medium", "high"] },
            dueDate: { type: "string", format: "date", example: "2025-12-31" },
            owner: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: { type: "string", example: "Error description" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js", "./controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);