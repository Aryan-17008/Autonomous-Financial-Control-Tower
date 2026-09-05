import { Logger } from "@nestjs/common";
import { OpenAiEnhancerService } from "./openai-enhancer.service";

describe("OpenAiEnhancerService", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("enabled", () => {
    it("should be disabled when OPENAI_API_KEY is not configured", () => {
      const originalKey = process.env.OPENAI_API_KEY;

      delete process.env.OPENAI_API_KEY;

      const service = new OpenAiEnhancerService();

      expect(service.enabled).toBe(false);

      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });
  });

  describe("enhance", () => {
    it("should return recommendations unchanged when OpenAI is disabled", async () => {
      const originalKey = process.env.OPENAI_API_KEY;

      delete process.env.OPENAI_API_KEY;

      const service = new OpenAiEnhancerService();

      const recommendations = [
        {
          id: "rec-1",
          action: "BLOCK",
          reason: "High fraud risk",
          risk_score: 0.9,
          status: "pending",
        },
      ] as any;

      const result = await service.enhance([], recommendations);

      expect(result).toEqual(recommendations);

      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      }
    });

    it("should handle an OpenAI response without enhancements", async () => {
      const originalKey = process.env.OPENAI_API_KEY;

      process.env.OPENAI_API_KEY = "test-key";

      const service = new OpenAiEnhancerService();

      const recommendations = [
        {
          id: "rec-1",
          action: "REVIEW",
          reason: "Original reason",
          risk_score: 0.5,
          status: "pending",
        },
      ] as any;

      (service as any).client = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({}),
                  },
                },
              ],
            }),
          },
        },
      };

      const result = await service.enhance([], recommendations);

      expect(result).toEqual(recommendations);

      if (originalKey !== undefined) {
        process.env.OPENAI_API_KEY = originalKey;
      } else {
        delete process.env.OPENAI_API_KEY;
      }
    });
  });

  it("should return an empty array when there are no recommendations", async () => {
    const service = new OpenAiEnhancerService();

    const result = await service.enhance([], []);

    expect(result).toEqual([]);
  });

  it("should preserve recommendations when the OpenAI API fails", async () => {
    const originalKey = process.env.OPENAI_API_KEY;

    process.env.OPENAI_API_KEY = "test-key";

    const service = new OpenAiEnhancerService();

    const recommendations = [
      {
        id: "rec-1",
        action: "BLOCK",
        reason: "High fraud risk",
        risk_score: 0.9,
        status: "pending",
      },
    ] as any;

    (service as any).client = {
      chat: {
        completions: {
          create: jest
            .fn()
            .mockRejectedValue(new Error("OpenAI API unavailable")),
        },
      },
    };

    jest.spyOn(Logger.prototype, "warn").mockImplementation();

    const result = await service.enhance([], recommendations);

    expect(result).toEqual(recommendations);
    expect(Logger.prototype.warn).toHaveBeenCalled();

    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it("should enhance a recommendation with a valid OpenAI response", async () => {
    const originalKey = process.env.OPENAI_API_KEY;

    process.env.OPENAI_API_KEY = "test-key";

    const service = new OpenAiEnhancerService();

    const recommendations = [
      {
        id: "rec-1",
        action: "BLOCK",
        reason: "High fraud risk",
        risk_score: 0.9,
        status: "pending",
      },
    ] as any;

    (service as any).client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    enhancements: [
                      {
                        index: 0,
                        reason: "AI detected strong fraud indicators.",
                        risk_score: 0.97,
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        },
      },
    };

    const result = await service.enhance([], recommendations);

    expect(result[0].reason).toBe("AI detected strong fraud indicators.");
    expect(result[0].risk_score).toBe(0.97);

    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it("should preserve a recommendation when there is no matching AI enhancement", async () => {
    const originalKey = process.env.OPENAI_API_KEY;

    process.env.OPENAI_API_KEY = "test-key";

    const service = new OpenAiEnhancerService();

    const recommendations = [
      {
        id: "rec-1",
        action: "BLOCK",
        reason: "High fraud risk",
        risk_score: 0.9,
        status: "pending",
      },
    ] as any;

    (service as any).client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    enhancements: [
                      {
                        index: 99,
                        reason: "This should not match",
                        risk_score: 0.2,
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        },
      },
    };

    const result = await service.enhance([], recommendations);

    expect(result).toEqual(recommendations);

    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it("should reject an invalid risk score and keep the original score", async () => {
    const originalKey = process.env.OPENAI_API_KEY;

    process.env.OPENAI_API_KEY = "test-key";

    const service = new OpenAiEnhancerService();

    const recommendations = [
      {
        id: "rec-1",
        action: "BLOCK",
        reason: "High fraud risk",
        risk_score: 0.9,
        status: "pending",
      },
    ] as any;

    (service as any).client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    enhancements: [
                      {
                        index: 0,
                        reason: "Updated reason",
                        risk_score: 2,
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        },
      },
    };

    const result = await service.enhance([], recommendations);

    expect(result[0].reason).toBe("Updated reason");
    expect(result[0].risk_score).toBe(0.9);

    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it("should preserve the original reason when AI returns an empty reason", async () => {
    const originalKey = process.env.OPENAI_API_KEY;

    process.env.OPENAI_API_KEY = "test-key";

    const service = new OpenAiEnhancerService();

    const recommendations = [
      {
        id: "rec-1",
        action: "BLOCK",
        reason: "Original reason",
        risk_score: 0.9,
        status: "pending",
      },
    ] as any;

    (service as any).client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    enhancements: [
                      {
                        index: 0,
                        reason: "   ",
                        risk_score: 0.8,
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        },
      },
    };

    const result = await service.enhance([], recommendations);

    expect(result[0].reason).toBe("Original reason");
    expect(result[0].risk_score).toBe(0.8);

    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });

  it("should return recommendations unchanged when OpenAI returns no content", async () => {
    const originalKey = process.env.OPENAI_API_KEY;

    process.env.OPENAI_API_KEY = "test-key";

    const service = new OpenAiEnhancerService();

    const recommendations = [
      {
        id: "rec-1",
        action: "REVIEW",
        reason: "Review transaction",
        risk_score: 0.5,
        status: "pending",
      },
    ] as any;

    (service as any).client = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: null,
                },
              },
            ],
          }),
        },
      },
    };

    const result = await service.enhance([], recommendations);

    expect(result).toEqual(recommendations);

    if (originalKey !== undefined) {
      process.env.OPENAI_API_KEY = originalKey;
    } else {
      delete process.env.OPENAI_API_KEY;
    }
  });
});
