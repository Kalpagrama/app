<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Вход через E-mail
        .q-pa-md.q-gutter-y-sm
            form(ref="form")
                q-input(type="email" ref="emailReg" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="checkEmail")
                q-input(type="password" ref="passwordReg" v-model="password" label="Придумай пароль" dense="dense" :rules="checkPassword")
                p.text-left.warning.text-caption.q-mt-sm(v-if="bemail") Пользователь с таким Email не найден! Пожалуйста зарегистрируйтесь!
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn.btn-auth(size='12px' type="submit" @click="onSubmit" :loading="submitting") Войти
                    q-btn.btn-auth(size='12px' to="/auth/register/email") Зарегистрироваться
                    q-btn.btn-auth(size='12px' to="/auth/restore") Восстановить пароль
</template>

<script>
    export default {
        name: 'PageMobileLogin',
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
        onSubmit() {
            const user = {
                email: this.email,
                password: this.password,
            };
            this.submitting = true;
            setTimeout(() => {
                if (this.$refs.emailReg.value === 'test@test.ru') {
                    this.bemail = true;
                    this.submitting = false;
                    this.$router.push('/home');
                } else {
                    this.submitting = false;
                    this.bemail = true;
                    alert(user.email);
                }
            }, 3000);
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
    };

</script>

<style lang="stylus"></style>
