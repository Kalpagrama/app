<script>
import { mapState } from 'vuex';

const VERBOSE = {
    'BAD_PASSWORD': 'Указан неверный пароль',
};

export default {
    name: 'AuthMixin',
    props: {},
    data() {
        return {}
    },
    computed: {
        ...mapState('providers', { auth: state => state.auth }),
    },
    methods: {
        verbose(code) {
            return VERBOSE[code] || 'Неизвестная ошибка';
        }
    }
}
</script>
