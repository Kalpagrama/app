<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через E-mail
        .q-pa-md.q-gutter-y-sm
            form(ref="form" @submit.prevent="onSubmit")
                q-input(type="email" ref="email" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="checkEmail")
                q-input(type="password" ref="password" v-model="password" label="Придумай пароль" dense="dense" :rules="checkPassword")
                p.text-left.warning.text-caption.q-mt-sm(v-if="bemail") Email уже зарегистрирован! Нажмите Восстановить чтобы сбросить старый пароль
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn.btn-auth(size='12px' type="submit" :loading="submitting" :disabled="!email || !password") Зарегистрироваться
                    q-btn.btn-auth(size='12px' to="/auth/restore") Восстановить пароль
</template>

<script>
import AuthMixin from '../AuthMixin';

const checkEmail = [val => !!val || '* Заполните поле email!', val => /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(val) || 'Введите корректный e-mail'];
const checkPassword = [val => !!val || '* Пароль не должен быть пустым!', val => val.length >= 6 || 'Минимально 6 символов'];

export default {
    name: 'PageMobileRegisterEmail',
    mixins: [AuthMixin],
    data() {
        return {
            email: null,
            password: null,
            submitting: false,
        };
    },
    computed: {
        checkEmail,
        checkPassword
    },
    methods: {
        async onSubmit() {
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
};
</script>

<style lang="stylus"></style>
