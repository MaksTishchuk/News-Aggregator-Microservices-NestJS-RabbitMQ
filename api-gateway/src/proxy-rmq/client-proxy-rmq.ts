import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Injectable()
export class ClientProxyRMQ {
  private user = this.configService.get<string>('RMQ_USER')
  private password = this.configService.get<string>('RMQ_PASSWORD')
  private url = this.configService.get<string>('RMQ_URL')

  constructor(private configService: ConfigService) {
  }

  getClientProxyAuthInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${this.user}:${this.password}@${this.url}`],
        queue: 'auth',
        queueOptions: {
          durable: true
        }
      }
    })
  }

  getClientProxyNewsInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${this.user}:${this.password}@${this.url}`],
        queue: 'news',
        queueOptions: {
          durable: true
        }
      }
    })
  }

  getClientProxyLoggerInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${this.user}:${this.password}@${this.url}`],
        queue: 'logger',
        queueOptions: {
          durable: true
        }
      }
    })
  }

  getClientProxyFilesInstance(): ClientProxy {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${this.user}:${this.password}@${this.url}`],
        queue: 'files',
        queueOptions: {
          durable: true
        }
      }
    })
  }

}