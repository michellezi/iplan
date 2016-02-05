//
//  DataManager.h
//  iPlan
//
//  Created by zijx on 16/2/4.
//  Copyright © 2016年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "RCTBridgeModule.h"
#import "FMDatabaseQueue.h"
#import "FMDatabase.h"

@interface DataManager : NSObject <RCTBridgeModule>

+(DataManager *)getInstance;
-(NSArray *)remakeDataBlob;
-(NSArray*)queryWithSqlCommand:(NSString *)sqlCommand;
-(BOOL)executeWithSqlCommand:(NSString *)sqlCommand;
-(BOOL)execUpdateInTransactionSync:(NSMutableArray *)updateSqlArr;

@end
