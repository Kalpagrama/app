<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через E-mail
        .q-pa-md.q-gutter-y-sm
            form(ref="form" @submit.prevent="onSubmit")
                q-input(type="email" ref="emailReg" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="checkEmail")
                q-input(type="password" ref="passwordReg" v-model="password" label="Придумай пароль" dense="dense" :rules="checkPassword")
                p.text-left.warning.text-caption.q-mt-sm(v-if="bemail") Email уже зарегистрирован! Нажмите Восстановить чтобы сбросить старый пароль
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn.btn-auth(size='12px' type="submit" :loading="submitting") Зарегистрироваться
                    q-btn.btn-auth(size='12px' to="/auth/restore") Восстановить пароль
</template>

<script>
import AuthProvider from '../../../store/api/AuthProvider';

const RESULT_ENUM = Object.freeze({ 'SUCCESS': 0, 'FAIL': 1 })
// Object.freeze(ResultEnum);
const EVENT_ENUM = Object.freeze({ 'USER_LOGIN': 0, 'USER_LOGOUT': 1, 'USER_CONFIRM': 2 })
// Object.freeze(EventEnum);
const ERROR_ENUM = Object.freeze({ 'UNKNOWN_ERROR': 0, 'PASSWORD_INCORRECT': 1, 'UNCONFIRMED_LOGIN_DISABLED': 2 })
// Object.freeze(EventEnum);

    export default {
        name: 'PageMobileRegisterEmail',
        data() {
        return {
            email: null,
            password: null,
            disabled: true,
            bemail: false,
            testMail: 'test@test.ru',
            submitting: false,
            resultEnum: RESULT_ENUM,
            eventEnum: EVENT_ENUM,
            errorEnum: ERROR_ENUM,
        };
    },
    methods: {
        async onSubmit() {
            if (!this.$refs.emailReg.hasError && !this.$refs.passwordReg.hasError && this.$refs.passwordReg.value && this.$refs.emailReg.value) {
                this.submitting = true;
                const user = {
                    email: this.email,
                    password: this.password,
                };
                const provider = new AuthProvider(this);
                await provider.login('LOGIN_EMAIL', user)
                    .then((res) => {
                        if (res.data === 'fail') {
                            this.showNotify(false, 'Похоже в базе уже имеется твой Email! Переходи к процедуре авторизации!');
                            this.submitting = false;
                        } else {
                            this.showNotify(true, 'Доброго пожаловать, ты уже на шаг ближе к сути!');
                            this.submitting = true;
                            this.$router.push('/greeting')
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                        this.submitting = false;
                        this.showNotify(false, err.message);
                    })
            } else {
                this.showNotify(false, 'Скорее всего вы допустили ошибку при вводе данных!');
            }
        },
        showNotify(bool, text) {
            if (bool === true) {
                this.$q.notify({
                    message: text,
                    color: 'green'
                })
            } else {
                this.$q.notify({
                    message: text,
                    color: 'red'
                })
            }
        },
      },
      computed: {
          checkEmail() {
              return [val => !!val || '* Заполните поле email!', val => /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(val) || 'Введите корректный e-mail'];
          },
          checkPassword() {
              return [val => !!val || '* Пароль не должен быть пустым!', val => val.length >= 6 || 'Минимально 6 символов'];
          },
       },
        beforeMount() {
            console.log('Go')
        },
    };
</script>

<style lang="stylus"></style>
