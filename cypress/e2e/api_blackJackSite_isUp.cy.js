describe('API Status Check', () => {
  const apiBaseUrl = Cypress.env('apiBaseUrl')

  it('should successfully access the Deck of Cards API', () => {
    cy.request('GET', 'https://deckofcardsapi.com/').then(response => {
      expect(response.status).to.eq(200)
    })
  })

  let deckId

  it('should create a new deck ', () => {
    cy.request('GET', 'https://deckofcardsapi.com/api/deck/new/').then(
      response => {
        expect(response.body.success).to.eq(true)
        expect(response.body.deck_id).to.be.a('string')
        expect(response.body.shuffled).to.eq(false)
        expect(response.body.remaining).to.eq(52)

        deckId = response.body.deck_id
        console.log(deckId)
      }
    )
  })

  it('should create and shuffle a new deck with 6 decks', () => {
    cy.request(
      'GET',
      'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=6'
    ).then(response => {
      expect(response.body.success).to.eq(true)
      deckId = response.body.deck_id

      expect(response.body.remaining).to.eq(312)
      expect(response.body.shuffled).to.eq(true)
    })
  })

  it('should draw three cards from the deck twice', () => {
    expect(deckId).to.be.a('string')

    const drawAndValidateCards = () => {
      cy.request(
        'GET',
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`
      ).then(response => {
        expect(response.body.success).to.eq(true)
        expect(response.body.cards).to.have.length(3)

        response.body.cards.forEach(card => {
          expect(card).to.have.all.keys(
            'code',
            'image',
            'images',
            'value',
            'suit'
          )
        })
      })
    }

    drawAndValidateCards()
    drawAndValidateCards()

    cy.request('GET', `https://deckofcardsapi.com/api/deck/${deckId}`).then(
      response => {
        expect(response.body.remaining).to.eq(306)
      }
    )
  })

  it('should deal three cards to each of two players', () => {
    expect(deckId).to.be.a('string')

    const dealCardsToPlayer = playerName => {
      cy.request(
        'GET',
        `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=3`
      ).then(response => {
        expect(response.body.success).to.eq(true)
        expect(response.body.cards).to.have.length(3)

        const cardCodes = response.body.cards.map(card => card.code).join(',')

        cy.request(
          'GET',
          `https://deckofcardsapi.com/api/deck/${deckId}/pile/${playerName}/add/?cards=${cardCodes}`
        )
      })
    }

    dealCardsToPlayer('player1')
    dealCardsToPlayer('player2')
  })

  it('should check if either player has blackjack', () => {
    const checkForBlackjack = cards => {
      const values = cards.map(card => card.value)
      const hasAce = values.includes('ACE')
      const hasTenPointCard = values.some(value =>
        ['10', 'JACK', 'QUEEN', 'KING'].includes(value)
      )
      return hasAce && hasTenPointCard
    }

    ;['player1', 'player2'].forEach(player => {
      cy.request(
        'GET',
        `https://deckofcardsapi.com/api/deck/${deckId}/pile/${player}/list/`
      ).then(response => {
        const cards = response.body.piles[player].cards
        if (checkForBlackjack(cards)) {
          console.log(`${player} has blackjack`)
        }
      })
    })
  })
})
