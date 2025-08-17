const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'BioVerse API',
      version: '1.0.0',
      description: 'API documentation for BioVerse backend services',
    },
    servers: [
      { url: process.env.API_BASE_URL || 'http://localhost:3000/api' }
    ],
    components: {
      schemas: {
        Patient: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'The patient ID.',
              example: 1
            },
            name: {
              type: 'string',
              description: "The patient's name.",
              example: 'John Doe'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: "The patient's date of birth.",
              example: '1990-01-01'
            },
            gender: {
              type: 'string',
              description: "The patient's gender.",
              example: 'Male'
            },
            contact: {
              type: 'string',
              description: "The patient's contact information.",
              example: 'john.doe@example.com'
            },
            address: {
              type: 'string',
              description: "The patient's address.",
              example: '123 Main St, Anytown, USA'
            }
          }
        },
        NewPatient: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: "The patient's name.",
              example: 'John Doe'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: "The patient's date of birth.",
              example: '1990-01-01'
            },
            gender: {
              type: 'string',
              description: "The patient's gender.",
              example: 'Male'
            },
            contact: {
              type: 'string',
              description: "The patient's contact information.",
              example: 'john.doe@example.com'
            },
            address: {
              type: 'string',
              description: "The patient's address.",
              example: '123 Main St, Anytown, USA'
            }
          }
        }
      },
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = { setupSwagger, swaggerSpec };
