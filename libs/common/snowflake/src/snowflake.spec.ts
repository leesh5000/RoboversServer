import { SnowflakeIdGenerator, SnowflakeFactory, NodeIdStrategy } from './snowflake';

describe('SnowflakeIdGenerator', () => {
  let generator: SnowflakeIdGenerator;

  beforeEach(() => {
    generator = new SnowflakeIdGenerator(1);
    SnowflakeFactory.reset();
  });

  describe('constructor', () => {
    it('should create instance with valid node ID', () => {
      expect(() => new SnowflakeIdGenerator(0)).not.toThrow();
      expect(() => new SnowflakeIdGenerator(1023)).not.toThrow();
    });

    it('should throw error for invalid node ID', () => {
      expect(() => new SnowflakeIdGenerator(-1)).toThrow('Node ID must be between 0 and 1023');
      expect(() => new SnowflakeIdGenerator(1024)).toThrow('Node ID must be between 0 and 1023');
    });
  });

  describe('generate', () => {
    it('should generate unique IDs', () => {
      const ids = new Set<bigint>();
      const count = 10000;

      for (let i = 0; i < count; i++) {
        ids.add(generator.generate());
      }

      expect(ids.size).toBe(count);
    });

    it('should generate sequential IDs in same millisecond', () => {
      const id1 = generator.generate();
      const id2 = generator.generate();

      expect(id2).toBeGreaterThan(id1);
    });

    it('should handle sequence overflow', () => {
      // Force sequence to max value
      (generator as any).sequence = 4095n;
      const id1 = generator.generate();
      const id2 = generator.generate();

      expect(id2).toBeGreaterThan(id1);
    });
  });

  describe('generateString', () => {
    it('should return string representation', () => {
      const id = generator.generateString();
      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });
  });

  describe('extractTimestamp', () => {
    it('should extract correct timestamp', () => {
      const beforeGenerate = new Date();
      const id = generator.generate();
      const afterGenerate = new Date();

      const extractedTime = SnowflakeIdGenerator.extractTimestamp(id);

      expect(extractedTime.getTime()).toBeGreaterThanOrEqual(beforeGenerate.getTime());
      expect(extractedTime.getTime()).toBeLessThanOrEqual(afterGenerate.getTime());
    });
  });

  describe('extractNodeId', () => {
    it('should extract correct node ID', () => {
      const nodeId = 42;
      const gen = new SnowflakeIdGenerator(nodeId);
      const id = gen.generate();

      expect(SnowflakeIdGenerator.extractNodeId(id)).toBe(nodeId);
    });
  });

  describe('extractSequence', () => {
    it('should extract correct sequence', () => {
      const id1 = generator.generate();
      const id2 = generator.generate();

      const seq1 = SnowflakeIdGenerator.extractSequence(id1);
      const seq2 = SnowflakeIdGenerator.extractSequence(id2);

      expect(seq1).toBe(0);
      expect(seq2).toBe(1);
    });
  });

  describe('concurrent generation', () => {
    it('should generate unique IDs from multiple generators', () => {
      const gen1 = new SnowflakeIdGenerator(1);
      const gen2 = new SnowflakeIdGenerator(2);
      const ids = new Set<bigint>();

      for (let i = 0; i < 1000; i++) {
        ids.add(gen1.generate());
        ids.add(gen2.generate());
      }

      expect(ids.size).toBe(2000);
    });
  });
});

describe('SnowflakeFactory', () => {
  beforeEach(() => {
    SnowflakeFactory.reset();
    delete process.env.SNOWFLAKE_NODE_ID;
  });

  describe('create with ENVIRONMENT strategy', () => {
    it('should create generator with environment node ID', () => {
      process.env.SNOWFLAKE_NODE_ID = '123';
      const generator = SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT);
      const id = generator.generate();

      expect(SnowflakeIdGenerator.extractNodeId(id)).toBe(123);
    });

    it('should throw error when environment variable not set', () => {
      expect(() => SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT))
        .toThrow('SNOWFLAKE_NODE_ID environment variable not set');
    });

    it('should throw error when environment variable is invalid', () => {
      process.env.SNOWFLAKE_NODE_ID = 'invalid';
      expect(() => SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT))
        .toThrow('SNOWFLAKE_NODE_ID must be a valid number');
    });
  });

  describe('create with STATIC strategy', () => {
    it('should create generator with static node ID', () => {
      const generator = SnowflakeFactory.create(NodeIdStrategy.STATIC, 456);
      const id = generator.generate();

      expect(SnowflakeIdGenerator.extractNodeId(id)).toBe(456);
    });

    it('should throw error when static node ID not provided', () => {
      expect(() => SnowflakeFactory.create(NodeIdStrategy.STATIC))
        .toThrow('Static node ID not provided');
    });
  });

  describe('create with RANDOM strategy', () => {
    it('should create generator with random node ID', () => {
      const generator = SnowflakeFactory.create(NodeIdStrategy.RANDOM);
      const id = generator.generate();
      const nodeId = SnowflakeIdGenerator.extractNodeId(id);

      expect(nodeId).toBeGreaterThanOrEqual(0);
      expect(nodeId).toBeLessThanOrEqual(1023);
    });
  });

  describe('singleton behavior', () => {
    it('should return same instance on multiple calls', () => {
      process.env.SNOWFLAKE_NODE_ID = '100';
      const gen1 = SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT);
      const gen2 = SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT);

      expect(gen1).toBe(gen2);
    });

    it('should create new instance after reset', () => {
      process.env.SNOWFLAKE_NODE_ID = '100';
      const gen1 = SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT);
      
      SnowflakeFactory.reset();
      const gen2 = SnowflakeFactory.create(NodeIdStrategy.ENVIRONMENT);

      expect(gen1).not.toBe(gen2);
    });
  });
});