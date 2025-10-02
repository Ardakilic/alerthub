import { describe, expect, test } from "@jest/globals";
import fixGitLabDateColumn from "../../plugins/rss-braider/fixGitLabDateColumn.js";

describe("fixGitLabDateColumn Plugin", () => {
  test("should set date from meta.date when itemOptions.date is null", () => {
    const item = {
      meta: {
        date: "2023-01-01T12:00:00Z",
      },
    };
    const itemOptions = {
      title: "Test Item",
      date: null,
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.toISOString()).toBe("2023-01-01T12:00:00.000Z");
  });

  test("should not modify date when itemOptions.date is not null", () => {
    const existingDate = new Date("2023-02-01T10:00:00Z");
    const item = {
      meta: {
        date: "2023-01-01T12:00:00Z",
      },
    };
    const itemOptions = {
      title: "Test Item",
      date: existingDate,
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.date).toBe(existingDate);
  });

  test("should not modify date when item.meta is undefined", () => {
    const item = {};
    const itemOptions = {
      title: "Test Item",
      date: null,
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.date).toBeNull();
  });

  test("should not modify date when item.meta.date is undefined", () => {
    const item = {
      meta: {},
    };
    const itemOptions = {
      title: "Test Item",
      date: null,
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.date).toBeNull();
  });

  test("should not modify date when item.meta.date is null", () => {
    const item = {
      meta: {
        date: null,
      },
    };
    const itemOptions = {
      title: "Test Item",
      date: null,
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.date).toBeNull();
  });

  test("should preserve other itemOptions properties", () => {
    const item = {
      meta: {
        date: "2023-01-01T12:00:00Z",
      },
    };
    const itemOptions = {
      title: "Test Item",
      date: null,
      description: "Test description",
      url: "https://example.com",
      author: "test-author",
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.title).toBe("Test Item");
    expect(result.description).toBe("Test description");
    expect(result.url).toBe("https://example.com");
    expect(result.author).toBe("test-author");
  });

  test("should handle different date formats", () => {
    const item = {
      meta: {
        date: "2023-12-25",
      },
    };
    const itemOptions = {
      title: "Test Item",
      date: null,
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.getFullYear()).toBe(2023);
    expect(result.date.getMonth()).toBe(11); // December is month 11
    expect(result.date.getDate()).toBe(25);
  });

  test("should handle invalid date strings gracefully", () => {
    const item = {
      meta: {
        date: "not-a-valid-date",
      },
    };
    const itemOptions = {
      title: "Test Item",
      date: null,
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.date).toBeInstanceOf(Date);
    expect(Number.isNaN(result.date.getTime())).toBe(true); // Invalid Date
  });

  test("should handle numeric timestamps", () => {
    const timestamp = 1672574400000; // 2023-01-01T12:00:00.000Z
    const item = {
      meta: {
        date: timestamp,
      },
    };
    const itemOptions = {
      title: "Test Item",
      date: null,
    };

    const result = fixGitLabDateColumn(item, itemOptions);

    expect(result.date).toBeInstanceOf(Date);
    expect(result.date.getTime()).toBe(timestamp);
  });

  test("should not modify original itemOptions object", () => {
    const item = {
      meta: {
        date: "2023-01-01T12:00:00Z",
      },
    };
    const itemOptions = {
      title: "Test Item",
      date: null,
    };

    const originalItemOptions = { ...itemOptions };
    const result = fixGitLabDateColumn(item, itemOptions);

    // The function should return the same object reference but with modified properties
    expect(result).toBe(itemOptions);
    expect(result.date).not.toBe(originalItemOptions.date);
  });
});
