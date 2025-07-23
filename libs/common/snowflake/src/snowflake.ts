/**
 * Snowflake ID Generator
 *
 * 64-bit ID 구조:
 * - 1 bit: 부호 비트 (항상 0)
 * - 41 bits: 타임스탬프 (밀리초)
 * - 10 bits: 노드 ID (0-1023)
 * - 12 bits: 시퀀스 번호 (0-4095)
 *
 * 초당 최대 409만개의 고유 ID 생성 가능
 */

export class SnowflakeIdGenerator {
  private static readonly EPOCH = 1640995200000n; // 2022-01-01 00:00:00 UTC
  private static readonly NODE_ID_BITS = 10n;
  private static readonly SEQUENCE_BITS = 12n;
  private static readonly MAX_NODE_ID =
    (1n << SnowflakeIdGenerator.NODE_ID_BITS) - 1n;
  private static readonly MAX_SEQUENCE =
    (1n << SnowflakeIdGenerator.SEQUENCE_BITS) - 1n;

  private readonly nodeId: bigint;
  private sequence = 0n;
  private lastTimestamp = -1n;

  constructor(nodeId: number) {
    if (nodeId < 0 || nodeId > Number(SnowflakeIdGenerator.MAX_NODE_ID)) {
      throw new Error(
        `Node ID must be between 0 and ${SnowflakeIdGenerator.MAX_NODE_ID}`,
      );
    }
    this.nodeId = BigInt(nodeId);
  }

  /**
   * 새로운 Snowflake ID 생성
   */
  public generate(): bigint {
    let timestamp = this.currentTime();

    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate ID');
    }

    if (timestamp === this.lastTimestamp) {
      this.sequence = (this.sequence + 1n) & SnowflakeIdGenerator.MAX_SEQUENCE;
      if (this.sequence === 0n) {
        timestamp = this.waitNextMillis(timestamp);
      }
    } else {
      this.sequence = 0n;
    }

    this.lastTimestamp = timestamp;

    return (
      ((timestamp - SnowflakeIdGenerator.EPOCH) <<
        (SnowflakeIdGenerator.NODE_ID_BITS +
          SnowflakeIdGenerator.SEQUENCE_BITS)) |
      (this.nodeId << SnowflakeIdGenerator.SEQUENCE_BITS) |
      this.sequence
    );
  }

  /**
   * ID를 문자열로 변환
   */
  public generateString(): string {
    return this.generate().toString();
  }

  /**
   * ID에서 타임스탬프 추출
   */
  public static extractTimestamp(id: bigint): Date {
    const timestamp =
      (id >>
        (SnowflakeIdGenerator.NODE_ID_BITS +
          SnowflakeIdGenerator.SEQUENCE_BITS)) +
      SnowflakeIdGenerator.EPOCH;
    return new Date(Number(timestamp));
  }

  /**
   * ID에서 노드 ID 추출
   */
  public static extractNodeId(id: bigint): number {
    return Number(
      (id >> SnowflakeIdGenerator.SEQUENCE_BITS) &
        SnowflakeIdGenerator.MAX_NODE_ID,
    );
  }

  /**
   * ID에서 시퀀스 번호 추출
   */
  public static extractSequence(id: bigint): number {
    return Number(id & SnowflakeIdGenerator.MAX_SEQUENCE);
  }

  private currentTime(): bigint {
    return BigInt(Date.now());
  }

  private waitNextMillis(timestamp: bigint): bigint {
    let current = this.currentTime();
    while (current <= timestamp) {
      current = this.currentTime();
    }
    return current;
  }
}

/**
 * 노드 ID 할당 전략
 */
export enum NodeIdStrategy {
  ENVIRONMENT = 'environment',
  STATIC = 'static',
  RANDOM = 'random',
}

/**
 * Snowflake ID 생성기 팩토리
 */
export class SnowflakeFactory {
  private static instance: SnowflakeIdGenerator | null = null;

  /**
   * 싱글톤 인스턴스 생성
   */
  public static create(
    strategy: NodeIdStrategy = NodeIdStrategy.ENVIRONMENT,
    staticNodeId?: number,
  ): SnowflakeIdGenerator {
    if (!this.instance) {
      const nodeId = this.determineNodeId(strategy, staticNodeId);
      this.instance = new SnowflakeIdGenerator(nodeId);
    }
    return this.instance;
  }

  /**
   * 노드 ID 결정
   */
  private static determineNodeId(
    strategy: NodeIdStrategy,
    staticNodeId?: number,
  ): number {
    switch (strategy) {
      case NodeIdStrategy.ENVIRONMENT: {
        const envNodeId = process.env.SNOWFLAKE_NODE_ID;
        if (!envNodeId) {
          throw new Error('SNOWFLAKE_NODE_ID environment variable not set');
        }
        const nodeId = parseInt(envNodeId, 10);
        if (isNaN(nodeId)) {
          throw new Error('SNOWFLAKE_NODE_ID must be a valid number');
        }
        return nodeId;
      }

      case NodeIdStrategy.STATIC: {
        if (staticNodeId === undefined) {
          throw new Error('Static node ID not provided');
        }
        return staticNodeId;
      }

      case NodeIdStrategy.RANDOM:
        return Math.floor(Math.random() * 1024); // MAX_NODE_ID + 1

      default:
        throw new Error(`Unknown node ID strategy: ${String(strategy)}`);
    }
  }

  /**
   * 인스턴스 초기화
   */
  public static reset(): void {
    this.instance = null;
  }
}
