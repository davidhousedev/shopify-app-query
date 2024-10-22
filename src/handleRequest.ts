import type {
  FetchResponseBody,
  ResponseWithType,
} from '@shopify/graphql-client'
import { Err, Ok, type Result } from 'ts-results-es'
import { ZodError } from 'zod'
import {
  CorruptData,
  GraphQLUser,
  JSONSyntax,
  NotFound,
  Query,
  Unexpected,
} from './errors.js'
import type { Json } from './types/utility.js'
import findUserErrors from './findUserErrors.js'
import { GraphqlQueryError } from '@shopify/shopify-api'

export default async function handleRequest<T, K>(
  queryFn: () => Promise<ResponseWithType<FetchResponseBody<T>>>,
  extractFn: (
    data: FetchResponseBody<T> extends FetchResponseBody<infer Data>
      ? Data
      : never,
  ) => K,
  context: { variables: Json },
): Promise<
  Result<
    NonNullable<K>,
    NotFound | CorruptData | JSONSyntax | GraphQLUser | Error
  >
> {
  let response: ResponseWithType<FetchResponseBody<T>>
  try {
    response = await queryFn()
  } catch (err) {
    let errContext: Json
    try {
      errContext = {
        variables: context.variables,
        response:
          err instanceof GraphqlQueryError
            ? (err.body ?? JSON.stringify(err))
            : JSON.stringify(err),
      }
    } catch (innerErr) {
      // if we can't parse the response, we just stringify the error
      errContext = {
        variables: context.variables,
        response: String(err),
        innerErr: String(innerErr),
      }
    }
    return Query.Err('Failed to make request', errContext, {
      cause: err,
    })
  }

  let json: FetchResponseBody<T>
  try {
    json = await response.json()
  } catch {
    return JSONSyntax.Err(
      'Could not parse JSON',
      {
        json: await response.text(),
      },
      { cause: response },
    )
  }

  const userErrors = findUserErrors(json)

  if (userErrors) {
    return GraphQLUser.Err(
      'User errors in the response',
      // lack of type safety here, can address if it becomes a problem
      { userErrors },
      { cause: response },
    )
  }

  // try to extract the expected data from the response
  let data: K
  try {
    const responseData = json.data ? json.data : null
    if (!responseData) {
      return Unexpected.Err(
        'Failed to parse expected data from response',
        { response: await response.text() },
        { cause: response },
      )
    }
    data = extractFn(responseData)
  } catch (err) {
    if (err instanceof ZodError) {
      return CorruptData.Err(
        'Failed to parse expected data from response',
        {
          issues: err.format(),
          variables: context.variables,
          data: json.data ?? {},
        },
        { cause: response },
      )
    } else {
      // TODO: create a new error type for this
      return Err(new Error('Unknown error!', { cause: err }))
    }
  }

  if (data === undefined) {
    return Unexpected.Err(
      'Extracted data is undefined. Did you forget to return a value from the extractor function?',
      {},
      { cause: json },
    )
  }

  // given that GraphQL responses will include something as null if it's not
  // found, we extrapolate a "not found" error if the extractor returns null
  if (data === null) {
    return NotFound.Err('Could not find data', context.variables, {
      cause: response,
    })
  }

  return Ok(data)
}
