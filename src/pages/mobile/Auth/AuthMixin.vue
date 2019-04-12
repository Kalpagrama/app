<script>
import { mapState } from 'vuex';

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
    }
}
</script>
