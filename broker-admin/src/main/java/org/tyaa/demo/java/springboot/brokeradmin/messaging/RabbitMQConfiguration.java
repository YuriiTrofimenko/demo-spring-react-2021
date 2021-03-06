package org.tyaa.demo.java.springboot.brokeradmin.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.RabbitListenerConfigurer;
import org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistrar;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.handler.annotation.support.DefaultMessageHandlerMethodFactory;

@Configuration
public class RabbitMQConfiguration implements RabbitListenerConfigurer {

    @Bean
    public TopicExchange orderExchange(
            @Value("${rabbitmq.order.exchange}") final String exchangeName
    ) {
        // поддготовка модели обменника,
        // которую потребитель создаст на RabbitMQ,
        // если его приложение запустится первым
        return new TopicExchange(exchangeName);
    }

    @Bean
    public Queue brokerOrderQueue(
            @Value("${rabbitmq.order.queue}") final String queueName
    ) {
        // поддготовка модели очереди входящих сообщений,
        // которую потребитель создаст на обменнике
        return new Queue(queueName, true);
    }

    @Bean
    public Binding binding(final Queue queue,
                           final TopicExchange exchange,
                           @Value("${rabbitmq.order.anything.routing-key}") final String routingKey
    ) {
        return BindingBuilder.bind(queue).
                to(exchange).with(routingKey);
    }

    @Bean
    public MappingJackson2MessageConverter consumerJackson2MessageConverter() {
        return new MappingJackson2MessageConverter();
    }

    @Bean
    public DefaultMessageHandlerMethodFactory messageHandlerMethodFactory() {
        DefaultMessageHandlerMethodFactory factory =
                new DefaultMessageHandlerMethodFactory();
        factory.setMessageConverter(consumerJackson2MessageConverter());
        return factory;
    }

    @Override
    public void configureRabbitListeners(
            RabbitListenerEndpointRegistrar registrar
    ) {
        registrar.setMessageHandlerMethodFactory(
                messageHandlerMethodFactory()
        );
    }
}
