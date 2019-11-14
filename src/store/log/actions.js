import assert from 'assert'

import { apolloProvider } from 'boot/apollo'

export const init = async (context) => {
  // if (context.getters.initialized) throw new Error('events state initialized already')
  if (context.getters.initialized) return
  context.commit('init')
  return true
}

function sendApi (context, level, info) {
  apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation logError($level: ErrorLevelEnum!, $error: String!) {
        logError(level: $level, error: $error)
      }`,
    variables: {
      level,
      error: JSON.stringify(info)
    }
  })
  .then(res => {
  })
  .catch(err => {
    context.commit('error', ['logger', err.message, err])
  })
}

// все ф-ии должны быть синхронными! (фронт не должен ждать пока логирование отправится на сервер)
export const error = (context, info) => {
  assert.ok(context.getters.initialized)
  context.commit('error', info)
  sendApi(context, 'ERROR', info)
}
export const warn = (context, info) => {
  assert.ok(context.getters.initialized)
  context.commit('warn', info)
  // sendApi(state, 'WARNING', info)
}
export const info = (context, info) => {
  assert.ok(context.getters.initialized)
  context.commit('info', info)
  // sendApi(state, 'INFO', info)
}
export const debug = (context, info) => {
  assert.ok(context.getters.initialized)
  context.commit('debug', info)
  // sendApi(state, 'DEBUG', info)
}
