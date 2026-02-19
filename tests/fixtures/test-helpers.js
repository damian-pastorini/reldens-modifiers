/**
 *
 * Reldens - Modifiers Test Helpers
 *
 */

class TestHelpers
{

    static createMockTarget(additionalProps = {})
    {
        return {
            health: 100,
            maxHealth: 150,
            attack: 50,
            defense: 30,
            level: 10,
            stats: {
                strength: 20,
                agility: 15,
                intelligence: 10,
                combat: {
                    attack: 100,
                    defense: 80
                }
            },
            ...additionalProps
        };
    }

    static createMockTargetWithNestedProps()
    {
        return {
            player: {
                stats: {
                    combat: {
                        attack: 100,
                        defense: 80
                    },
                    magic: {
                        power: 60
                    }
                }
            }
        };
    }

    static generateUniqueId(prefix = 'test')
    {
        return prefix+'-'+Date.now()+'-'+Math.random().toString(36).substring(2, 9);
    }

}

module.exports.TestHelpers = TestHelpers;
