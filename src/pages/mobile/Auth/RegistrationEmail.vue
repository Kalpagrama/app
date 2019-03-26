<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через E-mail
        .q-pa-md.q-gutter-y-sm
            form(ref="form" v-model="valid")
                q-input(type="email" ref="emailReg" v-model="email" label="Введи email" lazy-rules dense="dense" :rules="[ val => !!val || '* Заполните поле email!', val => /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,6}$/.test(val) || 'Введите корректный e-mail']")
                q-input(type="password" ref="passwordReg" v-model="password" label="Придумай пароль" dense="dense" :rules="[ val => !!val || '* Пароль не должен быть пустым!', val => val.length > 6 || 'Минимально 6 символов']")
                p.text-left.warning.text-caption.q-mt-sm(v-if="bemail") Email уже зарегистрирован! Нажмите Восстановить чтобы сбросить старый пароль
                .q-gutter-y-sm.full-height.q-pa-md.q-mt-sm
                    q-btn(size='12px' style="background: #7030A0; color: white; width: 240px;" type="submit" @click="onSubmitEmail" :loading="submitting") Зарегистрироваться
                    q-btn(size='12px' style="background: #7030A0; color: white; width: 240px;" to="/recover-password") Восстановить пароль
</template>

<script>
    export default {
        name: 'PageMobilePromo',
        data() {
        return {
            email: null,
            password: null,
            valid: false,
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
            if (this.$refs.emailReg.value === 'test@test.ru') {
                setTimeout(() => {
                    this.bemail = true;
                    this.submitting = false;
                }, 3000);
            } else {
                setTimeout(() => {
                    this.submitting = false;
                    this.bemail = false;
                    alert(user.email);
                }, 3000);
            }
        },
      },
    };

</script>

<style lang="stylus">
    .head-title {
        margin: 20px 0;
    }
    * {
        font-family: Montserrat;
    }
    .warning
        color red
</style>
