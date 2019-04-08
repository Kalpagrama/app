<template lang="pug">
    q-page.text-center.bold
        .q-pa-md
            h6.text-weight-bold.head-title Регистрация через E-mail
            q-btn(label="Клик" @click="test")
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
import Auth from '../../../store/api/AuthProvider';

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
        test() {
            const auth = new Auth();
            console.log(auth.checkAutorized);
        },
        generate_token (length) {
            const a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
            const b = [];
            for (let i = 0; i < length; i++) {
                const j = (Math.random() * (a.length - 1)).toFixed(0);
                b[i] = a[j];
            }
            return b.join('');
        },
        onSubmit() {
            if (!this.$refs.emailReg.hasError && !this.$refs.passwordReg.hasError && this.$refs.passwordReg.value && this.$refs.emailReg.value) {
                const user = {
                    email: this.email,
                    password: this.password,
                };
                /*
                this.submitting = true;
                const auth = new Auth();
                auth.login('EMAIL_LOGIN', user)
                    .then((res) => {
                    if (res === true) {
                        setTimeout(() => {
                            this.showNotify(true, 'Доброго пожаловать, ты уже на шаг ближе к сути!');
                            store.stateMutations.setUser(true);
                            store.store.user.oid = this.generate_token(32);
                            const uid = this.generate_token(32);
                            document.cookie = 'userName=MSX; path=/; expires=440;';
                            console.log(document.cookie.userName);
                            this.$router.push('/greeting')
                        }, 3000)
                    } else {
                        setTimeout(() => {
                            this.submitting = false;
                            this.showNotify(false, 'Такой email уже существует! Попробуйте пройти процедуру авторизации или восстановить пароль!');
                            store.stateMutations.setUser(false);
                        }, 3000)
                    }
                })
                */
            } else {
                this.showNotify(false, 'Скорее всего вы допустили ошибку!');
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
    };
</script>

<style lang="stylus"></style>
