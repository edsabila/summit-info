import React, { useState, useEffect } from 'react'
import { useMedia } from 'react-use'
import dayjs from 'dayjs'
import LocalLoader from '../LocalLoader'
import utc from 'dayjs/plugin/utc'
import { Box, Flex, Text } from 'rebass'
import styled from 'styled-components'

import Link, { CustomLink } from '../Link'
import { Divider } from '../../components'

import { formattedNum } from '../../helpers'
import { usePairData, useAllPairs } from '../../contexts/PairData'
import DoubleTokenLogo from '../DoubleLogo'
import { ButtonFaded } from '../ButtonStyled'

dayjs.extend(utc)

const PageButtons = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 2em;
  margin-bottom: 2em;
`

const Arrow = styled.div`
  color: #2f80ed;
  opacity: ${props => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  :hover {
    cursor: pointer;
  }
`

const List = styled(Box)`
  -webkit-overflow-scrolling: touch;
`

const DashGrid = styled.div`
  display: grid;
  grid-gap: 1em;
  grid-template-columns: 100px 1fr 1fr;
  grid-template-areas: 'name liq vol';

  > * {
    justify-content: flex-end;
    width: 100%;

    :first-child {
      justify-content: flex-start;
      text-align: left;
      width: 100px;
    }
  }

  @media screen and (min-width: 740px) {
    grid-template-columns: 1.5fr 1fr 1fr 180px 140px;
    grid-template-areas: ' name liq vol pool swap';
  }

  @media screen and (min-width: 1080px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 140px 140px;
    grid-template-areas: ' name liq vol txCount pool swap';
  }

  @media screen and (min-width: 1200px) {
    grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr 1fr 140px 140px;
    grid-template-areas: ' name liq reserve0 reserve0 vol txCount pool swap';
  }
`

const ListWrapper = styled.div``

const ClickableText = styled(Text)`
  &:hover {
    cursor: pointer;
    opacity: 0.6;
  }
  text-align: end;
  user-select: none;
`

const DataText = styled(Flex)`
  @media screen and (max-width: 40em) {
    font-size: 0.85rem;
  }

  align-items: center;
  text-align: center;

  & > * {
    font-size: 1em;
  }
`

const SORT_FIELD = {
  LIQ: 'reserveUSD',
  VOL: 'oneDayVolumeUSD',
  TXNS: 'oneDayTxns',
  RESERVE0: 'reserve0',
  RESERVE1: 'reserve1'
}

function PairList({ pairs }) {
  const allPairData = useAllPairs()

  const below740 = useMedia('(max-width: 740px)')
  const below1080 = useMedia('(max-width: 1080px)')
  const below1200 = useMedia('(max-width: 1200px)')

  // pagination
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  // sorting
  const [sortDirection, setSortDirection] = useState(true)
  const [sortedColumn, setSortedColumn] = useState(SORT_FIELD.LIQ)

  useEffect(() => {
    setMaxPage(1) // edit this to do modular
    setPage(1)
  }, [pairs])

  useEffect(() => {
    if (pairs) {
      let extraPages = 1
      if (Object.keys(pairs).length % ITEMS_PER_PAGE === 0) {
        extraPages = 0
      }
      setMaxPage(Math.floor(Object.keys(pairs).length / ITEMS_PER_PAGE) + extraPages)
    }
  }, [pairs])

  const sortedPairs =
    pairs &&
    allPairData &&
    pairs
      .sort((a, b) => {
        // pull in calculated one day volume
        a.oneDayVolumeUSD = allPairData?.[a.id]?.oneDayVolumeUSD
        b.oneDayVolumeUSD = allPairData?.[b.id]?.oneDayVolumeUSD
        return parseFloat(a[sortedColumn]) > parseFloat(b[sortedColumn])
          ? (sortDirection ? -1 : 1) * 1
          : (sortDirection ? -1 : 1) * -1
      })
      .slice(ITEMS_PER_PAGE * (page - 1), page * ITEMS_PER_PAGE)

  const ListItem = ({ item, index }) => {
    const itemData = usePairData(item.id)
    const liquidity = formattedNum(item.reserveUSD, true)
    const volume = formattedNum(itemData.oneDayVolumeUSD, true)

    if (item.token0.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      item.token0.name = 'ETH (Wrapped)'
      item.token0.symbol = 'ETH'
    }

    if (item.token1.id === '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2') {
      item.token1.name = 'ETH (Wrapped)'
      item.token1.symbol = 'ETH'
    }

    return (
      <DashGrid style={{ height: '60px' }}>
        <DataText area="name" fontWeight="500">
          <div style={{ marginRight: '1rem' }}>{index}</div>
          <DoubleTokenLogo a0={item.token0.id} a1={item.token1.id} margin={true} />
          <CustomLink
            style={{ marginLeft: '20px', whiteSpace: 'nowrap' }}
            to={'/pair/' + item.id}
            onClick={() => {
              window.scrollTo(0, 0)
            }}
          >
            {item.token0.symbol + '-' + item.token1.symbol}
          </CustomLink>
        </DataText>
        <DataText area="liq">{liquidity}</DataText>
        {!below1200 && <DataText area="reserve0">{formattedNum(item.reserve0) + ' ' + item.token0.symbol}</DataText>}
        {!below1200 && <DataText area="reserve1">{formattedNum(item.reserve1) + ' ' + item.token1.symbol}</DataText>}
        <DataText area="vol">{volume}</DataText>
        {!below1080 && <DataText area="txCount">{itemData.oneDayTxns}</DataText>}
        {!below740 && (
          <DataText area="pool">
            <ButtonFaded>
              <Link external href={''}>
                + Join Pool
              </Link>
            </ButtonFaded>
          </DataText>
        )}
        {!below740 && (
          <DataText area="swap">
            <ButtonFaded>
              <Link external href={''}>
                Swap Tokens
              </Link>
            </ButtonFaded>
          </DataText>
        )}
      </DashGrid>
    )
  }

  return (
    <ListWrapper>
      <DashGrid center={true} style={{ height: '60px' }}>
        <Flex alignItems="center" justifyContent="flexStart">
          <Text area="name" fontWeight="500">
            Name
          </Text>
        </Flex>
        <Flex alignItems="center" justifyContent="flexEnd">
          <ClickableText
            area="liq"
            onClick={e => {
              setSortedColumn(SORT_FIELD.LIQ)
              setSortDirection(sortedColumn !== SORT_FIELD.LIQ ? true : !sortDirection)
            }}
          >
            Liquidity {sortedColumn === SORT_FIELD.LIQ ? (!sortDirection ? '↑' : '↓') : ''}
          </ClickableText>
        </Flex>
        {!below1200 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="reserve1"
              onClick={e => {
                setSortedColumn(SORT_FIELD.RESERVE0)
                setSortDirection(sortedColumn !== SORT_FIELD.RESERVE0 ? true : !sortDirection)
              }}
            >
              Token Liquidity {sortedColumn === SORT_FIELD.RESERVE0 ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below1200 && (
          <Flex alignItems="center" justifyContent="flexEnd">
            <ClickableText
              area="reserve1"
              onClick={e => {
                setSortedColumn(SORT_FIELD.RESERVE1)
                setSortDirection(sortedColumn !== SORT_FIELD.RESERVE1 ? true : !sortDirection)
              }}
            >
              Token Liquidity {sortedColumn === SORT_FIELD.RESERVE1 ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        <>
          <Flex alignItems="center">
            <ClickableText
              area="vol"
              onClick={e => {
                setSortedColumn(SORT_FIELD.VOL)
                setSortDirection(sortedColumn !== SORT_FIELD.VOL ? true : !sortDirection)
              }}
            >
              Volume (24hrs)
              {sortedColumn === SORT_FIELD.VOL ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        </>
        {!below1080 && (
          <Flex alignItems="center">
            <ClickableText
              area="txnCount"
              onClick={e => {
                setSortedColumn(SORT_FIELD.TXNS)
                setSortDirection(sortedColumn !== SORT_FIELD.TXNS ? true : !sortDirection)
              }}
            >
              Transactions (24hrs)
              {sortedColumn === SORT_FIELD.TXNS ? (!sortDirection ? '↑' : '↓') : ''}
            </ClickableText>
          </Flex>
        )}
        {!below740 && (
          <Flex alignItems="center">
            <Text area="pool">Pool</Text>
          </Flex>
        )}
        {!below740 && (
          <Flex alignItems="center">
            <Text area="swap">Swap</Text>
          </Flex>
        )}
      </DashGrid>
      <Divider />
      <List p={0}>
        {!sortedPairs ? (
          <LocalLoader />
        ) : (
          sortedPairs.map((item, index) => {
            return (
              item && (
                <div key={index}>
                  <ListItem key={index} index={index + 1} item={item} />
                  <Divider />
                </div>
              )
            )
          })
        )}
      </List>
      <PageButtons>
        <div
          onClick={e => {
            setPage(page === 1 ? page : page - 1)
          }}
        >
          <Arrow faded={page === 1 ? true : false}>←</Arrow>
        </div>
        {'Page ' + page + ' of ' + maxPage}
        <div
          onClick={e => {
            setPage(page === maxPage ? page : page + 1)
          }}
        >
          <Arrow faded={page === maxPage ? true : false}>→</Arrow>
        </div>
      </PageButtons>
    </ListWrapper>
  )
}

export default PairList