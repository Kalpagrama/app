async function initApplication () {
}

// очистить кэши и БД
// todo если systemReset не помогает вызывается слишком часто - во второй попробовать hardReset
async function systemReset (clearAuthData = false, clearRxdb = true, reload = true, pwaResetFlag = true) {

}

// если уже войдено - ничего не сделает (опирается на k_user_oid и k_token)
// если не войдено - попытается войти
async function systemInit () {

}

export {
   initApplication,
   systemReset,
   systemInit
}
