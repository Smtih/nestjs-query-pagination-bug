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
  await dataSource.query(
    'TRUNCATE TABLE "tag", "sub_task", "todo_item" CASCADE',
  );
});

afterAll(async () => {
  await app.close();
});

describe('Todo Item Relationships (e2e)', () => {
  it('should demonstrate pagination bug with nested filter', async () => {
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
            title: 'Test Todo with Relationships',
          },
        },
      },
    });

    // Create two subtasks for the todo item
    await apolloServer.executeOperation({
      query: `
        mutation CreateSubTask($input: CreateOneSubTaskInput!) {
          createOneSubTask(input: $input) {
            id
            title
            todoItemId
          }
        }
      `,
      variables: {
        input: {
          subTask: {
            id: '1',
            title: 'First SubTask',
            todoItemId: '1',
          },
        },
      },
    });

    await apolloServer.executeOperation({
      query: `
        mutation CreateSubTask($input: CreateOneSubTaskInput!) {
          createOneSubTask(input: $input) {
            id
            title
            todoItemId
          }
        }
      `,
      variables: {
        input: {
          subTask: {
            id: '2',
            title: 'Second SubTask',
            todoItemId: '1',
          },
        },
      },
    });

    // Create a two tags for the todo item
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

    // Query subtasks with pagination and nested filter
    const paginatedResponse = await apolloServer.executeOperation({
      query: `
        query GetSubTasksWithFilter($paging: CursorPaging!, $filter: SubTaskDeepFilter, $sorting: [SubTaskSort!]) {
          subTasks(
            paging: $paging
            filter: $filter
            sorting: $sorting
          ) {
            totalCount
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            edges {
              node {
                id
                title
                todoItemId
              }
            }
          }
        }
      `,
      variables: {
        paging: {
          first: 1,
        },
        filter: {
          todoItem: {
            tags: {
              id: { isNot: null },
            },
          },
        },
        sorting: [
          {
            field: 'id',
            direction: 'ASC',
          },
        ],
      },
    });

    const paginatedResult =
      paginatedResponse.body.kind === 'single'
        ? paginatedResponse.body.singleResult
        : null;

    expect(paginatedResult.errors).toBeUndefined();

    // This should fail because the totalCount and hasNextPage are not being calculated correctly
    // with the nested filter condition
    expect(paginatedResult.data?.subTasks).toEqual({
      totalCount: 2,
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
        startCursor: expect.any(String),
        endCursor: expect.any(String),
      },
      edges: [
        {
          node: {
            id: '1',
            title: 'First SubTask',
            todoItemId: '1',
          },
        },
      ],
    });
  });
});
