<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Восcтановление пароля
        .q-pa-md.q-gutter-y-sm
            form(ref="form")
                q-input(type="email" ref="emailReg" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="checkEmail")
                p.text-left.success.text-caption.q-mt-sm(v-if="successRestore") Новый пароль отправлен на указанный почтовый ящик!
                p.text-left.warning.text-caption.q-mt-sm(v-if="falseEmail") Данный email не найден, пожалуйста пройдите этап регистрации!
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn.btn-auth(size='12px' type="submit" @click="onSubmitRestore" :loading="submitting") Восстановить пароль
                    q-btn.btn-auth(size='12px' type="text" @click="redirectToRegister" v-if="showBtnAuth") Перейти к авторизации
</template>

<script>
    export default {
        name: 'PageMobileRecoverPassword',
        data() {
        return {
            email: null,
            password: null,
            disabled: true,
            showBtnAuth: false,
            successRestore: false,
            falseEmail: false,
            testMail: 'test@test.ru',
            submitting: false,
        };
    },
    methods: {
        onSubmitRestore() {
            const user = {
                email: this.email,
            };
            this.submitting = true;
            setTimeout(() => {
                if (this.$refs.emailReg.value === 'test@test.ru') {
                    this.successRestore = false;
                    this.falseEmail = true;
                    this.submitting = false;
                } else {
                    this.submitting = false;
                    this.successRestore = true;
                    this.falseEmail = false;
                    this.showBtnAuth = true;
                    alert(user.email);
                }
            }, 3000);
        },
        redirectToRegister() {
            setTimeout(() => {
                this.$router.push('/auth/login');
            }, 500);
        },
    },
    computed: {
        checkEmail() {
            return [val => !!val || '* Заполните поле email!', val => /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(val) || 'Введите корректный e-mail'];
        },
    },
    };

</script>

<style lang="stylus"></style>
