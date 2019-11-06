import assert from 'assert'

import { apolloProvider } from 'boot/apollo'

export const init = async (state) => {
  if (state.getters.initialized) throw new Error('events state initialized already')
  state.commit('init')
  return true
}

function sendApi (state, level, info) {
  apolloProvider.clients.apiApollo.mutate({
    mutation: gql`
      mutation logError($level: ErrorLevelEnum!, $error: String!) {
        logError(level: $level, error: $error)
      }`,
    variables: {
      level,
      error: JSON.stringify(info)
    }
  }).then(res => {

  }).catch(err => {
    state.commit('error', ['logger', err.message, err])
  })
}

// все ф-ии должны быть синхронными! (фронт не должен ждать пока логирование отправится на сервер)
export const error = (state, info) => {
  assert.ok(state.getters.initialized)
  state.commit('error', info)
  sendApi(state, 'ERROR', info)
}
export const warn = (state, info) => {
  assert.ok(state.getters.initialized)
  state.commit('warn', info)
  // sendApi(state, 'WARNING', info)
}
export const info = (state, info) => {
  assert.ok(state.getters.initialized)
  state.commit('info', info)
  // sendApi(state, 'INFO', info)
}
export const debug = (state, info) => {
  assert.ok(state.getters.initialized)
  state.commit('debug', info)
  // sendApi(state, 'DEBUG', info)
}
