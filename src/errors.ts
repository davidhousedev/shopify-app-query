import { Err as ResultErr } from 'ts-results-es'
import type { Json } from './types/utility.js'

abstract class ContextualError<T = Json> extends Error {
  constructor(
    message: string,
    public context: T,
    options: ErrorOptions,
  ) {
    super(message, options)
    this.context = context
  }

  toJSON() {
    return {
      message: this.message,
      context: this.context,
      cause: this.cause,
      stack: this.stack?.split('\n').map((line) => line.trim()),
    }
  }
}

export class NotFound extends ContextualError {
  override name = 'NotFound' as const
  private constructor(
    message: string,
    public override context: Json,
    options: ErrorOptions,
  ) {
    super(message, context, options)
  }

  static Err(message: string, context: Json, options: ErrorOptions) {
    return ResultErr(new NotFound(message, context, options))
  }
}

export class GraphQLUser extends ContextualError {
  override name = 'GraphQLUserError' as const
  private constructor(
    message: string,
    public override context: {
      userErrors: { field: string; message: string }[]
    },
    options: ErrorOptions,
  ) {
    super(message, context, options)
  }

  static Err(
    message: string,
    context: { userErrors: { field: string; message: string }[] },
    options: ErrorOptions,
  ) {
    return ResultErr(new GraphQLUser(message, context, options))
  }
}

export class CorruptData extends ContextualError {
  override name = 'CorruptDataError' as const
  private constructor(
    message: string,
    public override context: Json,
    options: ErrorOptions,
  ) {
    super(message, context, options)
  }

  static Err(message: string, context: Json, options: ErrorOptions) {
    return ResultErr(new CorruptData(message, context, options))
  }
}

export class JSONSyntax extends ContextualError {
  override name = 'JSONSyntaxError' as const
  private constructor(
    message: string,
    public override context: { json: string },
    options: ErrorOptions,
  ) {
    super(message, context, options)
  }

  static Err(
    message: string,
    context: { json: string },
    options: ErrorOptions,
  ) {
    return ResultErr(new JSONSyntax(message, context, options))
  }
}

export class Mutation extends ContextualError<{
  mutation: string
  variables: Json
}> {
  override name = 'MutationError' as const
  private constructor(
    message: string,
    public override context: { mutation: string; variables: Json },
    options: ErrorOptions,
  ) {
    super(message, context, options)
  }

  static Err(
    message: string,
    context: { mutation: string; variables: Json },
    options: ErrorOptions,
  ) {
    return ResultErr(new Mutation(message, context, options))
  }
}

export class Query extends ContextualError {
  override name = 'QueryError' as const
  private constructor(
    message: string,
    public override context: Json,
    options: ErrorOptions,
  ) {
    super(message, context, options)
  }

  static Err(message: string, context: Json, options: ErrorOptions) {
    return ResultErr(new Query(message, context, options))
  }
}

export class Unexpected extends ContextualError {
  override name = 'UnexpectedError' as const
  private constructor(
    message: string,
    public override context: Json,
    options: ErrorOptions,
  ) {
    super(message, context, options)
  }

  static Err(message: string, context: Json, options: ErrorOptions) {
    return ResultErr(new Unexpected(message, context, options))
  }
}
