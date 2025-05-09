import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { getApolloServer } from '@nestjs/apollo';
import { ApolloServer, BaseContext } from '@apollo/server';
import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

let apolloServer: ApolloServer<BaseContext>;
let app: INestApplication;
let dataSource: DataSource;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  apolloServer = getApolloServer(app);
  dataSource = moduleFixture.get<DataSource>(DataSource);
});

beforeEach(async () => {
  // Clear the database before each test
  const entities = dataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = dataSource.getRepository(entity.name);
    await repository.clear();
  }
});

afterAll(async () => {
  await app.close();
});

describe('TodoItem GraphQL Operations (e2e)', () => {
  it('should create a todo item', async () => {
    const createResponse = await apolloServer.executeOperation({
      query: `
        mutation CreateTodoItem($input: CreateOneTodoItemInput!) {
          createOneTodoItem(input: $input) {
            id
            title
          }
        }
      `,
      variables: {
        input: {
          todoItem: {
            id: '1',
            title: 'Test Todo',
          },
        },
      },
    });

    const createData =
      createResponse.body.kind === 'single'
        ? createResponse.body.singleResult.data
        : null;

    expect(createResponse.body.kind).toBe('single');
    expect(createData).toBeDefined();
    expect(createData?.createOneTodoItem).toEqual({
      id: '1',
      title: 'Test Todo',
    });
  });

  it('should read a todo item', async () => {
    // First create a todo item
    await apolloServer.executeOperation({
      query: `
        mutation CreateTodoItem($input: CreateOneTodoItemInput!) {
          createOneTodoItem(input: $input) {
            id
            title
          }
        }
      `,
      variables: {
        input: {
          todoItem: {
            id: '1',
            title: 'Test Todo',
          },
        },
      },
    });

    // Then read it back
    const readResponse = await apolloServer.executeOperation({
      query: `
        query GetTodoItem($id: ID!) {
          todoItem(id: $id) {
            id
            title
          }
        }
      `,
      variables: {
        id: '1',
      },
    });

    const readData =
      readResponse.body.kind === 'single'
        ? readResponse.body.singleResult.data
        : null;

    expect(readResponse.body.kind).toBe('single');
    expect(readData).toBeDefined();
    expect(readData?.todoItem).toEqual({
      id: '1',
      title: 'Test Todo',
    });
  });
});
