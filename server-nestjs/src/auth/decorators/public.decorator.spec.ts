import 'reflect-metadata';
import { Public, IS_PUBLIC_KEY } from './public.decorator';

describe('Public decorator', () => {
  it('should be defined', () => {
    expect(Public).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof Public).toBe('function');
  });

  it('should return a decorator function', () => {
    const decorator = Public();

    expect(typeof decorator).toBe('function');
  });

  it('should set isPublic metadata to true', () => {
    class TestController {
      testRoute() {}
    }

    const descriptor = Object.getOwnPropertyDescriptor(
      TestController.prototype,
      'testRoute',
    )!;

    Public()(
      TestController.prototype,
      'testRoute',
      descriptor,
    );

    const metadata = Reflect.getMetadata(
      IS_PUBLIC_KEY,
      TestController.prototype.testRoute,
    );

    expect(metadata).toBe(true);
  });
});
