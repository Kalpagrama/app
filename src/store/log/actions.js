import assert from 'assert'

import { apolloProvider } from 'boot/apollo'

export const init = async (context) => {
  if (context.state.initialized) return
  assert.ok(apolloProvider)
  context.commit('init')
  return true
}

function sendApi (context, level, info) {
  if (!context.state.initialized) return
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
  if (!context.state.initialized) return
  // context.commit('error', info)
  sendApi(context, 'ERROR', info)
}
export const warn = (context, info) => {
  // if (!context.state.initialized) return
  // context.commit('warn', info)
  // sendApi(state, 'WARNING', info)
}
export const info = (context, info) => {
  // if (!context.state.initialized) return
  // context.commit('info', info)
  // sendApi(state, 'INFO', info)
}
export const debug = (context, info) => {
  // if (!context.state.initialized) return
  // context.commit('debug', info)
  // sendApi(state, 'DEBUG', info)
}
