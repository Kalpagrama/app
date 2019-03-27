<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через E-mail
        .q-pa-md.q-gutter-y-sm
            form(ref="form")
                q-input(type="email" ref="emailReg" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="[ val => !!val || '* Заполните поле email!', val => /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(val) || 'Введите корректный e-mail']")
                q-input(type="password" ref="passwordReg" v-model="password" label="Придумай пароль" dense="dense" :rules="[ val => !!val || '* Пароль не должен быть пустым!', val => val.length >= 6 || 'Минимально 6 символов']")
                p.text-left.warning.text-caption.q-mt-sm(v-if="bemail") Email уже зарегистрирован! Нажмите Восстановить чтобы сбросить старый пароль
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn(size='12px' style="background: #7030A0; color: white; width: 240px;" type="submit" @click="onSubmitEmail" :loading="submitting") Зарегистрироваться
                    q-btn(size='12px' style="background: #7030A0; color: white; width: 240px;" to="/restore") Восстановить пароль
</template>

<script>
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
        };
    },
    methods: {
        onSubmitEmail() {
            const user = {
                email: this.email,
                password: this.password,
            };
            this.submitting = true;
            setTimeout(() => {
                if (this.$refs.emailReg.value === 'test@test.ru') {
                    this.bemail = true;
                    this.submitting = false;
                } else {
                    this.submitting = false;
                    this.bemail = false;
                    alert(user.email);
                    this.$router.push('greeting');
                }
            }, 3000);
        },
      },
    };

</script>

<style lang="stylus">
    .head-title {
        margin: 10px 0;
    }
    .warning
        color red
</style>
