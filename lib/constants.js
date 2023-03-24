/**
 *
 * Reldens - Modifiers - Constants list
 *
 */

module.exports = {
    OPS: {
        INC: 1,
        DEC: 2,
        DIV: 3,
        MUL: 4,
        INC_P: 5,
        DEC_P: 6,
        SET: 7,
        SET_N: 9,
        METHOD: 8
    },
    COMPARE: {
        EQ: 'eq',
        NE: 'ne',
        LT: 'lt',
        GT: 'gt',
        LE: 'le',
        GE: 'ge'
    },
    TYPES: {
        INT: 'int',
        STRING: 'string'
    },
    MOD_MISSING_KEY: 'mk',
    MOD_MISSING_PROPERTY_KEY: 'mpk',
    MOD_MISSING_OPERATION: 'mo',
    MOD_MISSING_VALUE: 'mv',
    MOD_READY: 'mre',
    MOD_APPLIED: 'ma',
    MOD_REVERTED: 'mr',
    MOD_UNDEFINED_TARGET: 'mut',
    MOD_INVALID_CONDITIONS: 'mic',
    MOD_MISSING_CONDITION_INSTANCE: 'mmci',
    MOD_MODIFIER_ERROR: 'me',
};
