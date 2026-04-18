import { Logger } from '@nestjs/common';

export interface CircuitBreakerState {
  failures: number;
  lastFailure: Date | null;
  isOpen: boolean;
}

export class ResilientHttpClient {
  private readonly logger = new Logger(ResilientHttpClient.name);
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private readonly failureThreshold = 5;
  private readonly resetTimeout = 30000;

  async request<T>(
    serviceName: string,
    requestFn: () => Promise<T>,
    fallbackFn?: () => T | Promise<T>
  ): Promise<T> {
    const breaker = this.getOrCreateBreaker(serviceName);

    if (breaker.isOpen) {
      const timeSinceFailure = breaker.lastFailure 
        ? Date.now() - breaker.lastFailure.getTime() 
        : 0;
      
      if (timeSinceFailure > this.resetTimeout) {
        this.logger.log('Circuit breaker reset to half-open for ' + serviceName);
        breaker.isOpen = false;
        breaker.failures = 0;
      } else {
        this.logger.warn('Circuit breaker open for ' + serviceName + ', using fallback');
        if (fallbackFn) {
          return await fallbackFn();
        }
        throw new Error('Service ' + serviceName + ' is unavailable');
      }
    }

    try {
      const result = await requestFn();
      this.onSuccess(serviceName);
      return result;
    } catch (error) {
      this.onFailure(serviceName);
      
      if (fallbackFn) {
        this.logger.warn('Service ' + serviceName + ' failed, using fallback');
        return await fallbackFn();
      }
      
      throw error;
    }
  }

  private getOrCreateBreaker(serviceName: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(serviceName)) {
      this.circuitBreakers.set(serviceName, {
        failures: 0,
        lastFailure: null,
        isOpen: false,
      });
    }
    return this.circuitBreakers.get(serviceName)!;
  }

  private onSuccess(serviceName: string): void {
    const breaker = this.circuitBreakers.get(serviceName);
    if (breaker) {
      breaker.failures = 0;
    }
  }

  private onFailure(serviceName: string): void {
    const breaker = this.circuitBreakers.get(serviceName);
    if (breaker) {
      breaker.failures++;
      breaker.lastFailure = new Date();
      
      if (breaker.failures >= this.failureThreshold) {
        breaker.isOpen = true;
        this.logger.error('Circuit breaker opened for ' + serviceName);
      }
    }
  }

  resetCircuitBreaker(serviceName: string): void {
    this.circuitBreakers.delete(serviceName);
    this.logger.log('Circuit breaker reset for ' + serviceName);
  }
}
