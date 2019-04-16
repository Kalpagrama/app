<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Вход по e-mail
        .q-pa-md.q-gutter-y-sm
            form(ref="form")
            q-input(type="email" ref="email" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="checkEmail")
            q-input(type="password" ref="password" v-model="password" label="Придумай пароль" dense="dense" :rules="checkPassword")
            p.text-left.warning.text-caption.q-mt-sm(v-if="bemail") Пользователь с таким Email не найден! Пожалуйста зарегистрируйтесь!
            .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                q-btn.btn-auth(size='12px' type="submit" @click="login" :loading="submitting" :disabled="!email || !password || submitting") Войти
                q-btn.btn-auth(size='12px' @click="register" :disabled="!email || !password || submitting") Зарегистрироваться
                q-btn.btn-auth(size='12px' to="/auth/restore") Восстановить пароль
</template>

<script>
    import AuthMixin from '../AuthMixin';

    export default {
        name: 'PageMobileLoginEmail',
        mixins: [AuthMixin],
        data() {
        return {
            email: null,
            password: null,
            disabled: true,
            bemail: false,
            testMail: 'test@test.ru',
            submitting: false,
        };
    },
    methods: {
        login() {
            if (this.$refs.email.hasError || this.$refs.password.hasError) {
              this.auth.notifyError('Данные введены с ошибкой');
            };

            const params = {
                email: this.email,
                password: this.password,
            };

            this.submitting = true;

            this.auth.loginEmail(params)
                .then(() => {
                    this.$router.push('/home');
                })
                .finally(() => {
                    this.submitting = false;
                });
        },
        async register() {
            if (this.$refs.email.hasError || this.$refs.password.hasError) {
                this.auth.notifyError('Неверно введены данные');
            }

            this.submitting = true;
            const params = {
                email: this.email,
                password: this.password,
            };

            this.auth.loginEmail(params).then(() => {
                this.submitting = false;
                this.$router.push('/auth/login');
            })
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
    mounted() {},
    };

</script>

<style lang="stylus"></style>
