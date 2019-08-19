import { graphql, subscribe } from 'graphql'
import { PubSub, withFilter } from 'graphql-subscriptions'
import gql from 'graphql-tag'

import { Build, createBuild } from '.'

const isAsyncIterable = <T>(val: any): val is AsyncIterableIterator<T> => {
  if (val === null || val === undefined) return false
  const isIterable = typeof val[Symbol.iterator] === 'function'
  const isAsync = typeof val[Symbol.asyncIterator] === 'function'

  return isAsync || isIterable
}

describe('subscriptions', () => {
  let events: string[] = null

  beforeEach(() => (events = []))

  it('should add a subscription correctly', async () => {
    const pubSub = new PubSub()
    const build = createBuild<string, number>('test')

    build.addQuery<never, never, string[]>('events', '[String!]!', {
      resolver: () => events,
    })
    build.addSubscription('onEvent', 'String', {
      args: {
        active: 'Boolean!',
      },
      subscribe: (source, args) => {
        expect(args).toEqual({ active: true })
        return pubSub.asyncIterator('newEvent')
      },
      resolve: (source, args) => {
        expect(args).toEqual({ active: true })
        return source
      },
    })
    build.addMutation<never, { event: string }>('addEvent', 'String!', {
      args: {
        event: 'String',
      },
      resolver: (_, { event }) => {
        pubSub.publish('newEvent', event)
        events.push(event)
        return event
      },
    })

    const { typeDefs, resolvers } = build.toTypeDefs()
    const newEvent = `Random-${Math.random()}`

    const schema = build.toSchema()

    // const server = new ApolloServer({ schema })
    // const client = createTestClient(server)

    expect(
      await graphql({
        schema,
        source: `{ events }`,
      }),
    ).toEqual({ data: { events: [] } })

    const iterator = await subscribe(
      schema,
      gql`
        subscription {
          onEvent(active: true)
        }
      `,
      {},
      null,
    )

    if (!isAsyncIterable(iterator)) throw Error('subscription was incorrect')

    let iteratorCalled = false
    const next = iterator.next()
    next.then(result => {
      iteratorCalled = true
      expect(result.value.data).toEqual({ onEvent: newEvent })
    })

    expect(
      await graphql({
        schema,
        source: `mutation($event: String!) { addEvent(event: $event) }`,
        variableValues: {
          event: newEvent,
        },
      }),
    ).toEqual({ data: { addEvent: newEvent } })

    await next
    expect(iteratorCalled).toBeTruthy()

    expect(
      await graphql({
        schema,
        source: `{ events }`,
      }),
    ).toEqual({ data: { events: [newEvent] } })
  })
})
