<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через E-mail
        .q-pa-md.q-gutter-y-sm
            form(ref="form")
                q-input(type="email" ref="emailReg" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="rulesEmail")
                q-input(type="password" ref="passwordReg" v-model="password" label="Придумай пароль" dense="dense" :rules="rulesPassword")
                p.text-left.warning.text-caption.q-mt-sm(v-if="bemail") Email уже зарегистрирован! Нажмите Восстановить чтобы сбросить старый пароль
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn.btn-auth(size='12px' type="submit" @click="onSubmitEmail" :loading="submitting") Зарегистрироваться
                    q-btn.btn-auth(size='12px' to="/auth/restore") Восстановить пароль
</template>

<script>
    export default {
        name: 'PageMobileRegisterEmail',
        data() {
        return {
            email: null,
            rulesEmail: [val => !!val || '* Заполните поле email!', val => /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(val) || 'Введите корректный e-mail'],
            rulesPassword: [val => !!val || '* Пароль не должен быть пустым!', val => val.length >= 6 || 'Минимально 6 символов'],
            password: null,
            disabled: true,
            bemail: false,
            testMail: 'test@test.ru',
            submitting: false,
        };
    },
    methods: {
        onSubmitEmail() {
            const user = {
                email: this.email,
                password: this.password,
            };
            console.log(this.$router.currentRoute);
            this.submitting = true;
            setTimeout(() => {
                if (this.$refs.emailReg.value === 'test@test.ru') {
                    this.bemail = true;
                    this.submitting = false;
                } else {
                    this.submitting = false;
                    this.bemail = false;
                    alert(user.email);
                    this.$router.push('/greeting');
                }
            }, 3000);
        },
        backRoute() {
            return this.$router.back();
        },
      },
    };

</script>

<style lang="stylus"></style>
