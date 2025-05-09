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
  await dataSource.query('TRUNCATE TABLE "tag", "todo_item" CASCADE');
});

afterAll(async () => {
  await app.close();
});

describe('Tag GraphQL Operations (e2e)', () => {
  it('should create a tag', async () => {
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

    const createResponse = await apolloServer.executeOperation({
      query: `
        mutation CreateTag($input: CreateOneTagInput!) {
          createOneTag(input: $input) {
            id
            title
            todoItemId
            todoItem {
              id
              title
            }
          }
        }
      `,
      variables: {
        input: {
          tag: {
            id: '1',
            title: 'Test Tag',
            todoItemId: '1',
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
    expect(createData?.createOneTag).toEqual({
      id: '1',
      title: 'Test Tag',
      todoItemId: '1',
      todoItem: {
        id: '1',
        title: 'Test Todo',
      },
    });
  });

  it('should read a tag', async () => {
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

    // Then create a tag
    await apolloServer.executeOperation({
      query: `
        mutation CreateTag($input: CreateOneTagInput!) {
          createOneTag(input: $input) {
            id
            title
            todoItemId
          }
        }
      `,
      variables: {
        input: {
          tag: {
            id: '1',
            title: 'Test Tag',
            todoItemId: '1',
          },
        },
      },
    });

    // Then read it back
    const readResponse = await apolloServer.executeOperation({
      query: `
        query GetTag($id: ID!) {
          tag(id: $id) {
            id
            title
            todoItemId
            todoItem {
              id
              title
            }
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
    expect(readData?.tag).toEqual({
      id: '1',
      title: 'Test Tag',
      todoItemId: '1',
      todoItem: {
        id: '1',
        title: 'Test Todo',
      },
    });
  });

  it('should create a todo item with tags and read them back', async () => {
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
            title: 'Test Todo with Tags',
          },
        },
      },
    });

    // Then create tags for it
    await apolloServer.executeOperation({
      query: `
        mutation CreateTag($input: CreateOneTagInput!) {
          createOneTag(input: $input) {
            id
            title
            todoItemId
          }
        }
      `,
      variables: {
        input: {
          tag: {
            id: '1',
            title: 'First Tag',
            todoItemId: '1',
          },
        },
      },
    });

    await apolloServer.executeOperation({
      query: `
        mutation CreateTag($input: CreateOneTagInput!) {
          createOneTag(input: $input) {
            id
            title
            todoItemId
          }
        }
      `,
      variables: {
        input: {
          tag: {
            id: '2',
            title: 'Second Tag',
            todoItemId: '1',
          },
        },
      },
    });

    // Read back the todo item with its tags
    const readResponse = await apolloServer.executeOperation({
      query: `
        query GetTodoItemWithTags($id: ID!) {
          todoItem(id: $id) {
            id
            title
            tags {
              edges {
                node {
                  id
                  title
                  todoItemId
                }
              }
            }
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
      title: 'Test Todo with Tags',
      tags: {
        edges: [
          {
            node: {
              id: '1',
              title: 'First Tag',
              todoItemId: '1',
            },
          },
          {
            node: {
              id: '2',
              title: 'Second Tag',
              todoItemId: '1',
            },
          },
        ],
      },
    });
  });
});
