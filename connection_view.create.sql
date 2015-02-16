CREATE VIEW [dbo].[Connection_View]
 as
SELECT DISTINCT [Connection_Name]
      ,[Connection_Synonym]
      ,[Connection_Left_Term_Id]
      ,[Connection_Right_Term_Id]
      ,[Connection_Time_Limitation]
      ,[Connection_Position_Limitation]
      ,[Connection__Amount_Limitation]
      ,[Connection_Climate_Limitation]
      ,[Connection_Season_Limitation]
      ,[Connection_Measurement]
  FROM [dbo].[Connection]
GO
