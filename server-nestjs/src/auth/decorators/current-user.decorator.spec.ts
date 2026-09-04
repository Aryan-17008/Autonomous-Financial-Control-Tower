import { CurrentUser } from './current-user.decorator';

describe('CurrentUser decorator', () => {
  it('should be defined', () => {
    expect(CurrentUser).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof CurrentUser).toBe('function');
  });

  it('should be usable as a parameter decorator', () => {
    class TestController {
      test(@CurrentUser() _user: unknown) {}
    }

    expect(TestController).toBeDefined();
    expect(typeof TestController.prototype.test).toBe('function');
  });
});
