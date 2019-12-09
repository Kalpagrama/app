<template lang="pug">
.column.bg-white.fit
  nameFirstDialog
  nameSecondDialog
  phoneDialog
  emailDialog
  passwordDialog
  languageDialog
</template>

<script>
import nameFirstDialog from './nameFirstDialog'
import nameSecondDialog from './nameSecondDialog'
import emailDialog from './emailDialog'
import passwordDialog from './passwordDialog'
import languageDialog from './languageDialog'
import phoneDialog from './phoneDialog'
export default {
  name: 'pageApp__settings__account',
  components: {passwordDialog, phoneDialog, languageDialog, emailDialog, nameSecondDialog, nameFirstDialog},
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
  }
}
</script>
