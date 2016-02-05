//
//  DataManager.m
//  iPlan
//
//  Created by zijx on 16/2/4.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import "DataManager.h"
#import "AppDelegate.h"
#import "RCTRootView.h"

#define PATH_OF_DOCUMENT    [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0]

@interface DataManager()

@property(retain,nonatomic)FMDatabaseQueue * dbQueue;

@end

@implementation DataManager


RCT_EXPORT_MODULE();

+ (DataManager *)getInstance
{
  __strong static DataManager *instance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    instance = [[self alloc] init];
  });
  return instance;
}

- (id)init
{
  self = [super init];
  if (self) {
    // 在开发期间每次都重建数据库
    BOOL coverDB = NO;
    NSString * dbPath = [PATH_OF_DOCUMENT stringByAppendingPathComponent:@"plan.db"];
    NSLog(@"dbPath = %p, %@",self, dbPath);
    _dbQueue = [FMDatabaseQueue databaseQueueWithPath:dbPath];
    if (coverDB) {
      [self dropTable];
    }
    [self createTable];
  }
  return self;
}

- (void)dropTable
{
  NSMutableArray *sqls = [[NSMutableArray alloc] initWithCapacity:3];
  [sqls addObject:@"drop table Log"];
  [sqls addObject:@"drop table Goal"];
  [sqls addObject:@"drop table Plan"];
  __block BOOL bRet = NO;
  [self.dbQueue inTransaction:^(FMDatabase *db, BOOL *rollback) {
    for (NSInteger i = 0; i < [sqls count]; i++) {
      NSString *strUpdateSql = sqls[i];
      bRet = [db executeUpdate:strUpdateSql];
      if (NO == bRet) {
        break ;
      }
    }
  }];
  return;
}

- (void)createTable
{
  NSMutableArray *sqls = [[NSMutableArray alloc] initWithCapacity:3];
  [sqls addObject:@"create table if not exists Plan (id integer primary key, title varchar(255), startTime integer, endTime integer, folded tinyint(1) NOT NULL DEFAULT ('0'))"];
  [sqls addObject:@"create table if not exists Goal (id integer primary key, desc varchar(255), total integer, unit varchar(64), planId integer , num integer NOT NULL DEFAULT ('0'), foreign key (planId) references Plan(id) on delete cascade)"];
  [sqls addObject:@"create table if not exists Log (id integer primary key, desc varchar(255), time integer, num integer, goalId integer, foreign key (goalId) references Goal(id) on delete cascade)"];
  __block BOOL bRet = NO;
  [self.dbQueue inTransaction:^(FMDatabase *db, BOOL *rollback) {
    for (NSInteger i = 0; i < [sqls count]; i++) {
      NSString *strUpdateSql = sqls[i];
      bRet = [db executeUpdate:strUpdateSql];
      if (NO == bRet) {
        break ;
      }
    }
  }];
  return;
}

-(NSArray *)queryWithSqlCommand:(NSString *)sqlCommand
{
  __block NSMutableArray * results = nil;
  [self.dbQueue inDatabase:^(FMDatabase *db) {
    FMResultSet * aFMResultSet = [db executeQuery:sqlCommand];
    if (aFMResultSet) {
      results = [NSMutableArray arrayWithCapacity:aFMResultSet.columnCount];
      while ([aFMResultSet next]) {
        NSDictionary * dictData = [aFMResultSet resultDictionary];
        [results addObject:dictData];
      }
    }
  }];
  return results;
}

-(BOOL)executeWithSqlCommand:(NSString *)sqlCommand
{
  __block Boolean isOK = NO;
  [self.dbQueue inDatabase:^(FMDatabase *db)
   {
     isOK = [db executeUpdate:sqlCommand];
   }];
  return isOK;
}

- (BOOL)execUpdateInTransactionSync:(NSMutableArray *)updateSqlArr
{
  if ([updateSqlArr count] == 0) {
    return YES;
  }
  
  __block BOOL bRet = NO;
  [_dbQueue inTransaction:^(FMDatabase *db, BOOL *rollback) {
    for (NSInteger i = 0; i < [updateSqlArr count]; i++) {
      NSString *strUpdateSql = updateSqlArr[i];
      bRet = [db executeUpdate:strUpdateSql];
      if (NO == bRet) {
        break ;
      }
    }
  }];
  
  if (bRet) {
    //[self postNotificationAboutSqls:updateSqlArr];
  }
  return bRet;
}

- (NSArray *)remakeDataBlob
{
  NSString *sql = @"select * from Plan limit 10";
  NSArray *results = [self queryWithSqlCommand:sql];

  NSMutableDictionary *dataBlob = [NSMutableDictionary new];
  NSMutableArray *sectionIDs = [NSMutableArray new];
  NSMutableArray *rowIDs = [NSMutableArray new];

  for (int ii = 0; ii < results.count; ii++) {
    NSDictionary *plan = results[ii];
    NSString *sectionId = [NSString stringWithFormat:@"Plan %@",plan[@"id"]];
    [sectionIDs addObject:sectionId];
    [dataBlob setValue:plan forKey:sectionId];
    
    NSMutableArray *tmp = [NSMutableArray new];
    if ([[plan valueForKey:@"folded"] integerValue] == 1) {
      NSString *rowId = [NSString stringWithFormat:@"P %@,R 0",plan[@"id"]];
      [tmp addObject:rowId];
      [dataBlob setValue:@{@"id":@0,@"desc":@"",@"total":@0,@"num":@0,@"unit":@"",@"planId":plan[@"id"]} forKey:rowId];
    } else {
      NSString *sql2 = [NSString stringWithFormat:@"select * from Goal where planId=%@",plan[@"id"]];
      NSArray *goals = [self queryWithSqlCommand:sql2];
      if (goals.count == 0) {
        NSString *rowId = [NSString stringWithFormat:@"P %@,R 0",plan[@"id"]];
        [tmp addObject:rowId];
        [dataBlob setValue:@{@"id":@0,@"desc":@"",@"total":@0,@"num":@0,@"unit":@"",@"planId":plan[@"id"]} forKey:rowId];
      }
      for (int jj = 0; jj < goals.count; jj++) {
        NSMutableDictionary *goal = [NSMutableDictionary dictionaryWithDictionary:goals[jj]];
        // 此目标下的所有log
        NSString *sql3 = [NSString stringWithFormat:@"select * from Log where goalId=%@",goal[@"id"]];
        NSArray *logs = [self queryWithSqlCommand:sql3];
        [goal setValue:logs forKey:@"logs"];
        
        NSString *rowId = [NSString stringWithFormat:@"P %@,R %@",plan[@"id"],goal[@"id"]];
        [tmp addObject:rowId];
        [dataBlob setValue:goal forKey:rowId];
      }
    }
    [rowIDs addObject:tmp];
  }
  
  return @[dataBlob,sectionIDs,rowIDs];
}

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

#pragma mark - 导出到react native的方法
RCT_EXPORT_METHOD(queryWithSqlCommand:(NSString *)sqlCommand
                  withCallback:(RCTResponseSenderBlock)callbackBlock)
{
  callbackBlock(@[[self queryWithSqlCommand:sqlCommand]]);
}

RCT_EXPORT_METHOD(remakeDataBlob:(RCTResponseSenderBlock)callbackBlock)
{
  callbackBlock(@[[self remakeDataBlob]]);
}

RCT_EXPORT_METHOD(executeWithSqlCommand:(NSString *)sqlCommand
                  withCallback:(RCTResponseSenderBlock)callbackBlock)
{
  callbackBlock(@[@([self executeWithSqlCommand:sqlCommand])]);
}

RCT_EXPORT_METHOD(execUpdateInTransactionSync:(NSMutableArray *)updateSqlArr
                  withCallback:(RCTResponseSenderBlock)callbackBlock)
{
  callbackBlock(@[@([self execUpdateInTransactionSync:updateSqlArr])]);
}

@end
