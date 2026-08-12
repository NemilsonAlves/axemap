/**
 * AxéMap — Sistema de Internacionalização (i18n)
 * Idiomas: pt-BR, pt-PT, en, es, yo (Iorubá)
 *
 * Uso:
 *   const { t, locale, setLocale } = useI18n();
 *   t('busca.titulo') → "Buscar Casas de Axé"
 */

export type Locale = 'pt-BR' | 'pt-PT' | 'en' | 'es' | 'yo';

export const LOCALES: Array<{ id: Locale; label: string; flag: string }> = [
  { id: 'pt-BR', label: 'Português (Brasil)', flag: '🇧🇷' },
  { id: 'pt-PT', label: 'Português (Portugal)', flag: '🇵🇹' },
  { id: 'en',    label: 'English',              flag: '🇺🇸' },
  { id: 'es',    label: 'Español',              flag: '🇪🇸' },
  { id: 'yo',    label: 'Yorùbá',               flag: '🌍' },
];

export type TranslationKey =
  // Nav
  | 'nav.explorar' | 'nav.mapa' | 'nav.casas' | 'nav.casas_short' | 'nav.tradicao' | 'nav.rede' | 'nav.rede_short' | 'nav.cursos'
  | 'nav.entrar' | 'nav.cadastrar' | 'nav.sair' | 'nav.perfil' | 'nav.painel' | 'nav.admin' | 'nav.notificacoes'
  // Busca
  | 'busca.titulo' | 'busca.placeholder_nome' | 'busca.placeholder_estado' | 'busca.placeholder_cidade'
  | 'busca.botao' | 'busca.buscando' | 'busca.vazio' | 'busca.todos_estados' | 'busca.todas_cidades'
  | 'busca.carregando_cidades'
  // Auth
  | 'auth.entrar' | 'auth.criar_conta' | 'auth.email' | 'auth.senha' | 'auth.confirmar_senha'
  | 'auth.nome' | 'auth.esqueceu_senha' | 'auth.ja_tem_conta' | 'auth.criar'
  | 'auth.subtitle_login' | 'auth.subtitle_cadastro'
  | 'auth.art_titulo' | 'auth.art_subtitulo' | 'auth.art_frase'
  // Terreiros → Casa de Axé
  | 'casa.titulo' | 'casa.verificadas' | 'casa.novo' | 'casa.top' | 'casa.cadastrar'
  | 'casa.descricao_index'
  // Diáspora
  | 'diaspora.label' | 'diaspora.descricao'
  // Footer
  | 'footer.plataforma' | 'footer.comunidade' | 'footer.institucional'
  | 'footer.copyright' | 'footer.feito_com'
  // Geral
  | 'geral.loading' | 'geral.erro' | 'geral.voltar' | 'geral.ver_mapa' | 'geral.ver_mais';

type Translations = Record<TranslationKey, string>;

const PT_BR: Translations = {
  // Nav
  'nav.explorar':      'Explorar',
  'nav.mapa':          'Mapa',
  'nav.casas':         'Casas de Axé',
  'nav.casas_short':   'Casas de Axé',
  'nav.tradicao':      'Tradição',
  'nav.rede':          'Rede AxéMap',
  'nav.rede_short':    'Rede',
  'nav.cursos':        'Cursos',
  'nav.entrar':        'Entrar',
  'nav.cadastrar':     'Cadastrar Casa de Axé',
  'nav.sair':          'Sair',
  'nav.perfil':        'Perfil',
  'nav.painel':        'Painel',
  'nav.admin':         'Administração',
  'nav.notificacoes':  'Notificações',
  // Busca
  'busca.titulo':            'Buscar Casas de Axé / Asé',
  'busca.placeholder_nome':  'Nome, tradição, orixá...',
  'busca.placeholder_estado':'Selecione o estado',
  'busca.placeholder_cidade':'Selecione a cidade',
  'busca.botao':             'Buscar',
  'busca.buscando':          'Buscando...',
  'busca.vazio':             'Nenhuma casa de axé encontrada. Tente ajustar sua busca.',
  'busca.todos_estados':     'Todos os estados',
  'busca.todas_cidades':     'Todas as cidades',
  'busca.carregando_cidades':'Carregando cidades...',
  // Auth
  'auth.entrar':           'Entrar',
  'auth.criar_conta':      'Criar Conta',
  'auth.email':            'E-mail',
  'auth.senha':            'Senha',
  'auth.confirmar_senha':  'Confirmar Senha',
  'auth.nome':             'Nome',
  'auth.esqueceu_senha':   'Esqueceu a senha?',
  'auth.ja_tem_conta':     'Já tem conta? Entrar',
  'auth.criar':            'Criar Conta',
  'auth.subtitle_login':   'Bem-vindo de volta ao AxéMap',
  'auth.subtitle_cadastro':'Junte-se ao mapa vivo das tradições africanas',
  'auth.art_titulo':       'Axé para o Mundo',
  'auth.art_subtitulo':    'Da África às Américas, ao Caribe, à Europa e além',
  'auth.art_frase':        'Tradições vivas, memória preservada, comunidades conectadas.',
  // Casa de Axé
  'casa.titulo':          'Casas de Axé / Asé',
  'casa.verificadas':     'Casas Verificadas',
  'casa.novo':            'Novas Casas',
  'casa.top':             'Mais Buscadas',
  'casa.cadastrar':       'Cadastrar Casa de Axé',
  'casa.descricao_index': 'Conheça casas, templos e comunidades de matriz africana no Brasil e nas diásporas.',
  // Diáspora
  'diaspora.label':    'Diáspora',
  'diaspora.descricao':'Todo culto de tradição africana praticado fora do continente africano — nas Américas, no Caribe, na Europa e em todo o mundo.',
  // Footer
  'footer.plataforma':    'Plataforma',
  'footer.comunidade':    'Comunidade',
  'footer.institucional': 'Institucional',
  'footer.copyright':     'Um mapa vivo das tradições africanas e de suas diásporas.',
  'footer.feito_com':     'Feito com respeito à ancestralidade.',
  // Geral
  'geral.loading': 'Carregando...',
  'geral.erro':    'Ocorreu um erro. Tente novamente.',
  'geral.voltar':  'Voltar',
  'geral.ver_mapa':'Ver no mapa',
  'geral.ver_mais':'Ver mais',
};

const PT_PT: Translations = {
  ...PT_BR,
  'nav.casas':         'Casas de Axé',
  'nav.casas_short':   'Casas de Axé',
  'nav.rede_short':    'Rede',
  'nav.cadastrar':     'Registar Casa de Axé',
  'busca.titulo':      'Pesquisar Casas de Axé / Asé',
  'busca.botao':       'Pesquisar',
  'busca.buscando':    'A pesquisar...',
  'busca.vazio':       'Nenhuma casa de axé encontrada. Tente ajustar a sua pesquisa.',
  'auth.entrar':       'Entrar',
  'auth.criar_conta':  'Criar Conta',
  'auth.subtitle_login':'Bem-vindo de volta ao AxéMap',
  'auth.art_frase':    'Tradições vivas, memória preservada, comunidades ligadas.',
  'geral.loading':     'A carregar...',
};

const EN: Translations = {
  'nav.explorar':      'Explore',
  'nav.mapa':          'Map',
  'nav.casas':         'Houses of Axé',
  'nav.casas_short':   'Houses of Axé',
  'nav.tradicao':      'Tradition',
  'nav.rede':          'AxéMap Network',
  'nav.rede_short':    'Network',
  'nav.cursos':        'Courses',
  'nav.entrar':        'Sign In',
  'nav.cadastrar':     'Register a House of Axé',
  'nav.sair':          'Sign Out',
  'nav.perfil':        'Profile',
  'nav.painel':        'Dashboard',
  'nav.admin':         'Administration',
  'nav.notificacoes':  'Notifications',
  'busca.titulo':            'Search Houses of Axé / Asé',
  'busca.placeholder_nome':  'Name, tradition, orisha...',
  'busca.placeholder_estado':'Select a state',
  'busca.placeholder_cidade':'Select a city',
  'busca.botao':             'Search',
  'busca.buscando':          'Searching...',
  'busca.vazio':             'No houses of axé found. Try adjusting your search.',
  'busca.todos_estados':     'All states',
  'busca.todas_cidades':     'All cities',
  'busca.carregando_cidades':'Loading cities...',
  'auth.entrar':           'Sign In',
  'auth.criar_conta':      'Create Account',
  'auth.email':            'Email',
  'auth.senha':            'Password',
  'auth.confirmar_senha':  'Confirm Password',
  'auth.nome':             'Name',
  'auth.esqueceu_senha':   'Forgot password?',
  'auth.ja_tem_conta':     'Already have an account? Sign in',
  'auth.criar':            'Create Account',
  'auth.subtitle_login':   'Welcome back to AxéMap',
  'auth.subtitle_cadastro':'Join the living map of African traditions',
  'auth.art_titulo':       'Axé to the World',
  'auth.art_subtitulo':    'From Africa to the Americas, the Caribbean, Europe and beyond',
  'auth.art_frase':        'Living traditions, preserved memory, connected communities.',
  'casa.titulo':          'Houses of Axé / Asé',
  'casa.verificadas':     'Verified Houses',
  'casa.novo':            'New Houses',
  'casa.top':             'Most Searched',
  'casa.cadastrar':       'Register a House of Axé',
  'casa.descricao_index': 'Discover houses, temples and African-heritage communities in Brazil and the diaspora.',
  'diaspora.label':    'Diaspora',
  'diaspora.descricao':'Any African-tradition practice outside the African continent — across the Americas, Caribbean, Europe and the world.',
  'footer.plataforma':    'Platform',
  'footer.comunidade':    'Community',
  'footer.institucional': 'Institutional',
  'footer.copyright':     'A living map of African traditions and their diasporas.',
  'footer.feito_com':     'Made with respect for ancestry.',
  'geral.loading': 'Loading...',
  'geral.erro':    'An error occurred. Please try again.',
  'geral.voltar':  'Go back',
  'geral.ver_mapa':'View on map',
  'geral.ver_mais':'See more',
};

const ES: Translations = {
  'nav.explorar':      'Explorar',
  'nav.mapa':          'Mapa',
  'nav.casas':         'Casas de Axé',
  'nav.casas_short':   'Casas de Axé',
  'nav.tradicao':      'Tradición',
  'nav.rede':          'Red AxéMap',
  'nav.rede_short':    'Red',
  'nav.cursos':        'Cursos',
  'nav.entrar':        'Iniciar sesión',
  'nav.cadastrar':     'Registrar Casa de Axé',
  'nav.sair':          'Cerrar sesión',
  'nav.perfil':        'Perfil',
  'nav.painel':        'Panel',
  'nav.admin':         'Administración',
  'nav.notificacoes':  'Notificaciones',
  'busca.titulo':            'Buscar Casas de Axé / Asé',
  'busca.placeholder_nome':  'Nombre, tradición, orishá...',
  'busca.placeholder_estado':'Selecciona el estado',
  'busca.placeholder_cidade':'Selecciona la ciudad',
  'busca.botao':             'Buscar',
  'busca.buscando':          'Buscando...',
  'busca.vazio':             'No se encontraron casas de axé. Intente ajustar su búsqueda.',
  'busca.todos_estados':     'Todos los estados',
  'busca.todas_cidades':     'Todas las ciudades',
  'busca.carregando_cidades':'Cargando ciudades...',
  'auth.entrar':           'Iniciar sesión',
  'auth.criar_conta':      'Crear cuenta',
  'auth.email':            'Correo electrónico',
  'auth.senha':            'Contraseña',
  'auth.confirmar_senha':  'Confirmar contraseña',
  'auth.nome':             'Nombre',
  'auth.esqueceu_senha':   '¿Olvidaste tu contraseña?',
  'auth.ja_tem_conta':     '¿Ya tienes cuenta? Iniciar sesión',
  'auth.criar':            'Crear cuenta',
  'auth.subtitle_login':   'Bienvenido de nuevo a AxéMap',
  'auth.subtitle_cadastro':'Únete al mapa vivo de las tradiciones africanas',
  'auth.art_titulo':       'Axé para el Mundo',
  'auth.art_subtitulo':    'De África a las Américas, el Caribe, Europa y más allá',
  'auth.art_frase':        'Tradiciones vivas, memoria preservada, comunidades conectadas.',
  'casa.titulo':          'Casas de Axé / Asé',
  'casa.verificadas':     'Casas Verificadas',
  'casa.novo':            'Nuevas Casas',
  'casa.top':             'Más Buscadas',
  'casa.cadastrar':       'Registrar Casa de Axé',
  'casa.descricao_index': 'Descubre casas, templos y comunidades de herencia africana en Brasil y las diásporas.',
  'diaspora.label':    'Diáspora',
  'diaspora.descricao':'Todo culto de tradición africana practicado fuera del continente africano — en las Américas, el Caribe, Europa y todo el mundo.',
  'footer.plataforma':    'Plataforma',
  'footer.comunidade':    'Comunidad',
  'footer.institucional': 'Institucional',
  'footer.copyright':     'Un mapa vivo de las tradiciones africanas y sus diásporas.',
  'footer.feito_com':     'Hecho con respeto a la ancestralidad.',
  'geral.loading': 'Cargando...',
  'geral.erro':    'Ocurrió un error. Inténtalo de nuevo.',
  'geral.voltar':  'Volver',
  'geral.ver_mapa':'Ver en el mapa',
  'geral.ver_mais':'Ver más',
};

const YO: Translations = {
  'nav.explorar':      'Ṣàwárí',
  'nav.mapa':          'Maapu',
  'nav.casas':         'Ilé Àṣà',
  'nav.casas_short':   'Ilé Àṣà',
  'nav.tradicao':      'Ìtàn àti Àṣà',
  'nav.rede':          'Àjọ AxéMap',
  'nav.rede_short':    'Àjọ',
  'nav.cursos':        'Ẹ̀kọ́',
  'nav.entrar':        'Wọlé',
  'nav.cadastrar':     'Forúkọsílẹ̀ Ilé Àṣà',
  'nav.sair':          'Jáde',
  'nav.perfil':        'Àwòrán mi',
  'nav.painel':        'Pánẹ̀ẹ̀lì',
  'nav.admin':         'Ìṣàkóso',
  'nav.notificacoes':  'Ìfitónilétí',
  'busca.titulo':            'Wá Ilé Àṣà / Asé',
  'busca.placeholder_nome':  'Orúkọ, àṣà, òrìṣà...',
  'busca.placeholder_estado':'Yan ìpínlẹ̀',
  'busca.placeholder_cidade':'Yan ìlú',
  'busca.botao':             'Wá',
  'busca.buscando':          'Ń wá...',
  'busca.vazio':             'A kò rí ilé àṣà. Gbìyànjú yí ìwádìí rẹ padà.',
  'busca.todos_estados':     'Gbogbo ìpínlẹ̀',
  'busca.todas_cidades':     'Gbogbo ìlú',
  'busca.carregando_cidades':'Ń kó ìlú wọlé...',
  'auth.entrar':           'Wọlé',
  'auth.criar_conta':      'Ṣẹ̀dá àkọọ́lẹ̀',
  'auth.email':            'Ìméèlì',
  'auth.senha':            'Ọ̀rọ̀ aṣínà',
  'auth.confirmar_senha':  'Jẹ́rìísí ọ̀rọ̀ aṣínà',
  'auth.nome':             'Orúkọ',
  'auth.esqueceu_senha':   'Ṣé o gbàgbé ọ̀rọ̀ aṣínà rẹ?',
  'auth.ja_tem_conta':     'Ṣé o ti ní àkọọ́lẹ̀? Wọlé',
  'auth.criar':            'Ṣẹ̀dá àkọọ́lẹ̀',
  'auth.subtitle_login':   'E káàbọ̀ padà sí AxéMap',
  'auth.subtitle_cadastro':'Darapọ̀ mọ́ maapu alààyè ti àṣà Àfríkà',
  'auth.art_titulo':       'Àṣà Àfríkà fún Gbogbo Ayé',
  'auth.art_subtitulo':    'Láti Àfríkà dé Amẹ́ríkà, Karibeani, Yúróòpù àti jù bẹ̀ẹ̀ lọ',
  'auth.art_frase':        'Àṣà alààyè, ìrántí tí a tọ́jú, àwùjọ tí a so pọ̀.',
  'casa.titulo':          'Ilé Àṣà / Asé',
  'casa.verificadas':     'Ilé Àṣà Tí A Jẹ́rìísí',
  'casa.novo':            'Ilé Àṣà Tuntun',
  'casa.top':             'Àwọn Tí A Wá Jùlọ',
  'casa.cadastrar':       'Forúkọsílẹ̀ Ilé Àṣà',
  'casa.descricao_index': 'Ṣàwárí àwọn ilé, tẹmpili àti àwùjọ ìpilẹ̀ Àfríkà ní Brasiili àti àgbègbè diaspora.',
  'diaspora.label':    'Diaspora',
  'diaspora.descricao':'Gbogbo ìsìn àṣà Àfríkà tí a ṣe ní ìta kọ́ńtínẹ́ǹtì Àfríkà — ní Amẹ́ríkà, Karibeani, Yúróòpù àti káàkiri ayé.',
  'footer.plataforma':    'Pẹpẹ',
  'footer.comunidade':    'Àwùjọ',
  'footer.institucional': 'Àjọ',
  'footer.copyright':     'Maapu alààyè ti àṣà Àfríkà àti diaspora wọn.',
  'footer.feito_com':     'Ṣe pẹ̀lú ìbọwọ̀ fún àwọn baba àti ìyá wa.',
  'geral.loading': 'Ń gbéra...',
  'geral.erro':    'Àṣìṣe kan ṣẹlẹ̀. Gbìyànjú lẹ́ẹ̀kan sí i.',
  'geral.voltar':  'Padà',
  'geral.ver_mapa':'Wo ní maapu',
  'geral.ver_mais':'Wo díẹ̀ síi',
};

export const TRANSLATIONS: Record<Locale, Translations> = {
  'pt-BR': PT_BR,
  'pt-PT': PT_PT,
  'en':    EN,
  'es':    ES,
  'yo':    YO,
};

export function translate(locale: Locale, key: TranslationKey): string {
  return TRANSLATIONS[locale]?.[key] ?? TRANSLATIONS['pt-BR'][key] ?? key;
}
