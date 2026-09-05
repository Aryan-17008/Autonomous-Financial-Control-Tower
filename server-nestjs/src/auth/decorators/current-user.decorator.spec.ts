import { ExecutionContext } from '@nestjs/common';

describe('CurrentUser', () => {
  let factory: (data: unknown, ctx: ExecutionContext) => unknown;

  beforeEach(() => {
    jest.resetModules();

    jest.doMock('@nestjs/common', () => {
      const actual = jest.requireActual('@nestjs/common');

      return {
        ...actual,
        createParamDecorator: jest.fn(
          (callback: (data: unknown, ctx: ExecutionContext) => unknown) => {
            factory = callback;
            return callback;
          },
        ),
      };
    });
  });

  afterEach(() => {
    jest.dontMock('@nestjs/common');
  });

  it('should be defined', async () => {
    const { CurrentUser } = await import('./current-user.decorator');

    expect(CurrentUser).toBeDefined();
  });

  it('should return the authenticated user from the request', async () => {
    const { CurrentUser } = await import('./current-user.decorator');

    const user = {
      id: 1,
      email: 'test@example.com',
      role: 'analyst',
    };

    const getRequest = jest.fn().mockReturnValue({
      user,
    });

    const switchToHttp = jest.fn().mockReturnValue({
      getRequest,
    });

    const context = {
      switchToHttp,
    } as unknown as ExecutionContext;

    const result = factory(undefined, context);

    expect(switchToHttp).toHaveBeenCalled();
    expect(getRequest).toHaveBeenCalled();
    expect(result).toEqual(user);
    expect(CurrentUser).toBeDefined();
  });

  it('should return undefined when the request has no user', async () => {
    await import('./current-user.decorator');

    const getRequest = jest.fn().mockReturnValue({});

    const context = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest,
      }),
    } as unknown as ExecutionContext;

    const result = factory(undefined, context);

    expect(result).toBeUndefined();
  });
});