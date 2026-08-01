import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

type OpenApiDocument = {
  paths: {
    '/api/tasks/{id}': {
      put: {
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: string };
            };
          };
        };
        responses: Record<string, unknown>;
      };
    };
  };
  components: {
    responses: Record<string, { content?: Record<string, unknown> }>;
    schemas: {
      CreateTaskRequest: {
        properties: {
          title: {
            minLength: number;
            maxLength: number;
          };
        };
      };
      UpdateTaskRequest: {
        required: string[];
        properties: {
          title: {
            minLength: number;
            maxLength: number;
          };
        };
      };
    };
  };
};

const projectRoot = resolve(process.cwd(), '..');
const contractPath = resolve(projectRoot, 'openapi.yaml');
const ignoredDirectories = new Set([
  '.git',
  'dist',
  'node_modules',
  'target',
  'test-results',
]);

function findOpenApiContracts(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return ignoredDirectories.has(entry.name) ? [] : findOpenApiContracts(entryPath);
    }

    return entry.isFile() && entry.name.toLowerCase() === 'openapi.yaml'
      ? [entryPath]
      : [];
  });
}

function loadContract(): OpenApiDocument {
  return parse(readFileSync(contractPath, 'utf8')) as OpenApiDocument;
}

describe('canonical OpenAPI contract', () => {
  it('keeps openapi.yaml at the project root as the only canonical contract', () => {
    const contracts = findOpenApiContracts(projectRoot).map((path) =>
      relative(projectRoot, path).replaceAll('\\', '/'),
    );

    expect(contracts).toEqual(['openapi.yaml']);
  });

  it('parses the contract and preserves the required title constraints', () => {
    const contract = loadContract();
    const title = contract.components.schemas.CreateTaskRequest.properties.title;

    expect(title.minLength).toBe(3);
    expect(title.maxLength).toBe(100);
  });

  it('declares the title-only PUT update contract and required responses', () => {
    const contract = loadContract();
    const updateOperation = contract.paths['/api/tasks/{id}'].put;
    const updateRequest = contract.components.schemas.UpdateTaskRequest;

    expect(updateOperation.requestBody.content['application/json'].schema.$ref).toBe(
      '#/components/schemas/UpdateTaskRequest',
    );
    expect(updateOperation.responses).toHaveProperty('200');
    expect(updateOperation.responses).toHaveProperty('400');
    expect(updateOperation.responses).toHaveProperty('404');
    expect(updateOperation.responses).toHaveProperty('500');
    expect(updateRequest.required).toEqual(['title']);
    expect(updateRequest.properties.title.minLength).toBe(3);
    expect(updateRequest.properties.title.maxLength).toBe(100);
  });

  it.each(['BadRequest', 'NotFound', 'InternalServerError'])(
    'declares application/problem+json for %s',
    (responseName) => {
      const contract = loadContract();

      expect(contract.components.responses[responseName].content).toHaveProperty(
        'application/problem+json',
      );
    },
  );
});
